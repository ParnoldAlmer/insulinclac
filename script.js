class InsulinCalculator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
        this.bindWeightSliderEvents();
        this.setupInputValidation();
    }

    initializeElements() {
        this.penSelect = document.getElementById('penSelect');
        this.daySupplyInput = document.getElementById('daySupply');
        this.unitsPerDoseInput = document.getElementById('unitsPerDose');
        this.doseFrequencyInput = document.getElementById('doseFrequency');
        this.concentrationInput = document.getElementById('concentration');
        this.volumePerPenInput = document.getElementById('volumePerPen');
        this.calculateBtn = document.getElementById('calculateBtn');
        this.copyBtn = document.getElementById('copyBtn');
        
        this.disclaimerBtn = document.getElementById('disclaimerBtn');
        this.disclaimerModal = document.getElementById('disclaimerModal');
        this.closeModal = document.getElementById('closeModal');
        this.closeModalBtn = document.getElementById('closeModalBtn');
        
        this.resultsDiv = document.getElementById('results');
        this.errorDiv = document.getElementById('errorMessage');
        this.totalUnitsSpan = document.getElementById('totalUnits');
        this.totalMLSpan = document.getElementById('totalML');
        this.pensToOrderSpan = document.getElementById('pensToOrder');
        this.prescriptionTextP = document.getElementById('prescriptionText');
        
        this.boxInfoDiv = document.getElementById('boxInfo');
        this.pensPerBoxSpan = document.getElementById('pensPerBox');
        this.monthsPerBoxSpan = document.getElementById('monthsPerBox');
        
        this.patientWeightInput = document.getElementById('patientWeight');
        this.weightUnitToggle = document.getElementById('weightUnitToggle');
        this.dosingSlider = document.getElementById('dosingSlider');
        this.sliderValueSpan = document.getElementById('sliderValue');
        this.estimatedDoseSpan = document.getElementById('estimatedDose');
        this.weightBasedDosingDiv = document.getElementById('weightBasedDosing');
        this.pricingInfoDiv = document.getElementById('pricingInfo');
        this.pricingTextSpan = document.getElementById('pricingText');
        
        this.wastageToggle = document.getElementById('wastageToggle');
        this.wastageDisplay = document.getElementById('wastageDisplay');
        this.expirationWarning = document.getElementById('expirationWarning');
        this.sigGeneration = document.getElementById('sigGeneration');
        
        this.insulinPens = null;
        this.selectedPen = null;
        this.includeWastage = true;
        
        this.populateDropdown();
    }

    bindEvents() {
        this.calculateBtn.addEventListener('click', () => this.calculate());
        this.copyBtn.addEventListener('click', () => this.copyPrescription());
        
        this.disclaimerBtn.addEventListener('click', () => this.showDisclaimer());
        this.closeModal.addEventListener('click', () => this.hideDisclaimer());
        this.closeModalBtn.addEventListener('click', () => this.hideDisclaimer());
        this.disclaimerModal.addEventListener('click', (e) => {
            if (e.target === this.disclaimerModal) {
                this.hideDisclaimer();
            }
        });
        
        this.penSelect.addEventListener('change', (e) => {
            const selectedValue = e.target.value;
            if (selectedValue && this.insulinPens) {
                const selectedPen = this.findPenByValue(selectedValue);
                if (selectedPen) {
                    const penType = this.findPenType(selectedValue);
                    this.setPenValues(selectedPen.concentration, selectedPen.volume, penType);
                    this.toggleWeightBasedDosing(penType);
                    this.showPricingInfo(selectedValue, selectedPen);
                    this.checkExpirationWarning(selectedValue);
                }
            } else {
                this.toggleWeightBasedDosing(null);
                this.showPricingInfo(null, null);
                this.hideExpirationWarning();
            }
        });
        
        // Wastage toggle event
        if (this.wastageToggle) {
            this.wastageToggle.addEventListener('change', () => {
                this.includeWastage = this.wastageToggle.checked;
                this.calculate();
            });
        }
        
        // Live calculation on input change
        const inputs = [
            this.daySupplyInput,
            this.unitsPerDoseInput,
            this.doseFrequencyInput,
            this.concentrationInput,
            this.volumePerPenInput
        ];
        
        inputs.forEach(input => {
            input.addEventListener('input', () => this.calculate());
            input.addEventListener('change', () => this.calculate());
        });
    }

    getInputValues() {
        return {
            daySupply: parseFloat(this.daySupplyInput.value) || 30,
            unitsPerDose: parseFloat(this.unitsPerDoseInput.value),
            doseFrequency: parseFloat(this.doseFrequencyInput.value) || 1,
            concentration: parseFloat(this.concentrationInput.value),
            volumePerPen: parseFloat(this.volumePerPenInput.value)
        };
    }

    validateInputs(values) {
        const errors = [];
        
        if (!values.unitsPerDose || values.unitsPerDose <= 0) {
            errors.push('Units per dose is required and must be greater than 0');
        }
        
        if (!values.concentration || values.concentration <= 0) {
            errors.push('Insulin concentration is required and must be greater than 0');
        }
        
        if (!values.volumePerPen || values.volumePerPen <= 0) {
            errors.push('Volume per pen is required and must be greater than 0');
        }
        
        if (values.daySupply <= 0) {
            errors.push('Day supply must be greater than 0');
        }
        
        if (values.doseFrequency <= 0) {
            errors.push('Dose frequency must be greater than 0');
        }
        
        return errors;
    }

    calculateResults(values) {
        // Total units needed = units/dose × doses/day × days
        let totalUnits = values.unitsPerDose * values.doseFrequency * values.daySupply;
        
        // Add wastage if enabled (5-10% overhead plus priming)
        if (this.includeWastage) {
            const wastagePercent = 0.075; // 7.5% average wastage
            const primingUnits = Math.ceil(totalUnits / (values.unitsPerDose * values.doseFrequency)) * 2; // 2 units per pen priming
            totalUnits = totalUnits * (1 + wastagePercent) + primingUnits;
        }
        
        // Total mL needed = total units ÷ units/mL
        const totalML = totalUnits / values.concentration;
        
        // Pens to order = ceil(total mL ÷ mL per pen)
        let pensToOrder = Math.ceil(totalML / values.volumePerPen);
        
        // Check expiration constraints
        const expirationCheck = this.checkPenExpiration(values.daySupply, pensToOrder);
        if (expirationCheck.needsMorePens) {
            pensToOrder = expirationCheck.recommendedPens;
        }
        
        return {
            totalUnits: Math.round(totalUnits * 100) / 100,
            totalML: Math.round(totalML * 100) / 100,
            pensToOrder,
            expirationWarning: expirationCheck.warning,
            wastageIncluded: this.includeWastage
        };
    }

    generatePrescriptionNote(values, results) {
        const insulinType = this.selectedPen ? this.selectedPen.generic : 'insulin';
        const frequency = values.doseFrequency === 1 ? 'daily' : `${values.doseFrequency} times daily`;
        
        return `Order ${results.pensToOrder} pen${results.pensToOrder > 1 ? 's' : ''} of ${insulinType} ${values.concentration} units/mL, use ${values.unitsPerDose} units ${frequency}, ${values.daySupply} day supply`;
    }
    
    generateRxSig(values, results) {
        const insulinType = this.selectedPen ? this.selectedPen.generic : 'insulin';
        const brandName = this.selectedPen ? this.selectedPen.brand : 'Insulin Pen';
        const frequency = values.doseFrequency === 1 ? 'once daily' : `${values.doseFrequency} times daily`;
        const ndcCode = this.selectedPen && this.selectedPen.ndc_codes ? this.selectedPen.ndc_codes[0] : 'N/A';
        const refills = Math.max(0, Math.floor(365 / values.daySupply) - 1);
        
        return {
            sig: `Inject ${values.unitsPerDose} units subcutaneously ${frequency}.`,
            disp: `Disp: ${results.pensToOrder} pen${results.pensToOrder > 1 ? 's' : ''} (${values.volumePerPen} mL each)`,
            refills: `Refills: ${refills}`,
            ndc: `NDC: ${ndcCode}`,
            fullSig: `${insulinType} ${values.concentration} units/mL pen\n\nInject ${values.unitsPerDose} units subcutaneously ${frequency}.\n\nDisp: ${results.pensToOrder} pen${results.pensToOrder > 1 ? 's' : ''} (${values.volumePerPen} mL each)\nRefills: ${refills}\nNDC: ${ndcCode}`
        };
    }

    displayResults(results, prescriptionNote) {
        // Validate calculation results before displaying
        const validation = this.validateCalculationResults(results);
        
        if (!validation.isValid) {
            this.displayError(validation.errors);
            return;
        }
        
        this.totalUnitsSpan.textContent = `${results.totalUnits} units`;
        this.totalMLSpan.textContent = `${results.totalML} mL`;
        this.pensToOrderSpan.textContent = results.pensToOrder;
        this.prescriptionTextP.textContent = prescriptionNote;
        
        // Show wastage info if enabled
        if (this.wastageDisplay) {
            this.wastageDisplay.textContent = results.wastageIncluded ? 
                '(Includes 7.5% wastage + priming)' : '';
        }
        
        // Show expiration warning if needed
        if (results.expirationWarning) {
            this.showExpirationWarning(results.expirationWarning);
        }
        
        // Generate and display Rx Sig
        const values = this.getInputValues();
        const rxSig = this.generateRxSig(values, results);
        if (this.sigGeneration) {
            this.sigGeneration.innerHTML = `
                <div class="text-sm font-mono bg-gray-50 p-3 rounded border">
                    <div class="font-bold mb-2">Prescription Sig:</div>
                    <div>${rxSig.sig}</div>
                    <div class="mt-2">${rxSig.disp}</div>
                    <div>${rxSig.refills}</div>
                    <div>${rxSig.ndc}</div>
                </div>
            `;
        }
        
        // Show warnings if any
        if (validation.warnings.length > 0) {
            this.showCalculationWarnings(validation.warnings);
        }
        
        this.updateResultsUI();
        
        this.resultsDiv.classList.remove('hidden');
        this.errorDiv.classList.add('hidden');
    }
    
    validateCalculationResults(results) {
        const errors = [];
        const warnings = [];
        
        // Check for unreasonable total units
        if (results.totalUnits > 10000) {
            errors.push('Calculated total units is extremely high. Please verify inputs.');
        } else if (results.totalUnits > 3000) {
            warnings.push('High total units calculated. Please double-check dosing.');
        }
        
        // Check for unreasonable pen count
        if (results.pensToOrder > 50) {
            errors.push('Calculated pen count is unusually high. Please verify inputs.');
        } else if (results.pensToOrder > 20) {
            warnings.push('High number of pens calculated. Please verify day supply and dosing.');
        }
        
        // Check for very small doses that might indicate input errors
        if (results.totalUnits < 1) {
            warnings.push('Very low total units calculated. Please verify dosing inputs.');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    
    showCalculationWarnings(warnings) {
        // Create warning display above results
        const existingWarning = this.resultsDiv.querySelector('.calculation-warnings');
        if (existingWarning) {
            existingWarning.remove();
        }
        
        const warningDiv = document.createElement('div');
        warningDiv.className = 'calculation-warnings bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4';
        
        const title = document.createElement('div');
        title.className = 'text-sm font-medium text-yellow-800 mb-2';
        title.textContent = '⚠️ Please Review:';
        warningDiv.appendChild(title);
        
        warnings.forEach(warning => {
            const warningText = document.createElement('div');
            warningText.className = 'text-sm text-yellow-700';
            warningText.textContent = `• ${warning}`;
            warningDiv.appendChild(warningText);
        });
        
        this.resultsDiv.insertBefore(warningDiv, this.resultsDiv.firstChild);
    }

    displayError(errors) {
        this.errorDiv.querySelector('p').textContent = errors.join('. ');
        this.errorDiv.classList.remove('hidden');
        this.resultsDiv.classList.add('hidden');
        this.boxInfoDiv.classList.add('hidden');
    }

    calculate() {
        const values = this.getInputValues();
        
        // Don't show validation errors if essential fields are empty (user hasn't started yet)
        if (!values.unitsPerDose || !values.concentration || !values.volumePerPen) {
            this.resultsDiv.classList.add('hidden');
            this.errorDiv.classList.add('hidden');
            return;
        }
        
        const errors = this.validateInputs(values);
        
        if (errors.length > 0) {
            this.displayError(errors);
            return;
        }
        
        const results = this.calculateResults(values);
        const prescriptionNote = this.generatePrescriptionNote(values, results);
        
        this.displayResults(results, prescriptionNote);
    }

    async copyPrescription() {
        try {
            const text = this.prescriptionTextP.textContent;
            await navigator.clipboard.writeText(text);
            
            // Visual feedback
            const originalText = this.copyBtn.textContent;
            this.copyBtn.textContent = 'Copied!';
            this.copyBtn.classList.add('bg-green-600');
            this.copyBtn.classList.remove('bg-blue-600');
            
            setTimeout(() => {
                this.copyBtn.textContent = originalText;
                this.copyBtn.classList.remove('bg-green-600');
                this.copyBtn.classList.add('bg-blue-600');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            
            // Fallback: show alert with text to copy manually
            alert(`Copy this prescription note:\n\n${this.prescriptionTextP.textContent}`);
        }
    }

    async populateDropdown() {
        try {
            const response = await fetch('final_insulin_pens.json');
            const data = await response.json();
            this.insulinPens = data;
            
            const groups = {
                'basal': 'Basal Insulins',
                'rapid': 'Rapid-Acting Insulins',
                'ultra-rapid': 'Ultra-Rapid Acting Insulins'
            };
            
            Object.entries(groups).forEach(([key, label]) => {
                if (data[key] && data[key].length > 0) {
                    const optgroup = document.createElement('optgroup');
                    optgroup.label = label;
                    
                    data[key].forEach(pen => {
                        const option = document.createElement('option');
                        option.value = pen.value;
                        
                        // Add $35 tag for pens with GoodRx pricing
                        const hasGoodRxPricing = ['lantus-solostar', 'toujeo-solostar', 'admelog-solostar', 'apidra-solostar'].includes(pen.value);
                        const priceTag = hasGoodRxPricing ? ' $35' : '';
                        
                        option.textContent = `${pen.brand} - ${pen.generic} (${pen.concentration} U/mL, ${pen.volume} mL)${priceTag}`;
                        optgroup.appendChild(option);
                    });
                    
                    this.penSelect.appendChild(optgroup);
                }
            });
            
            // Set default selection to Lantus SoloStar
            this.penSelect.value = 'lantus-solostar';
            const defaultPen = this.findPenByValue('lantus-solostar');
            if (defaultPen) {
                const penType = this.findPenType('lantus-solostar');
                this.setPenValues(defaultPen.concentration, defaultPen.volume, penType);
                this.toggleWeightBasedDosing(penType);
                this.showPricingInfo('lantus-solostar', defaultPen);
            }
        } catch (error) {
            console.error('Error loading insulin pens:', error);
        }
    }

    setPenValues(unitsPerMl, mlPerPen, penType = null) {
        this.concentrationInput.value = unitsPerMl;
        this.volumePerPenInput.value = mlPerPen;
        
        if (penType === 'rapid' || penType === 'ultra-rapid') {
            this.doseFrequencyInput.value = 3;
        } else if (penType === 'basal') {
            this.doseFrequencyInput.value = 1;
        }
        
        const selectedValue = this.penSelect.value;
        this.selectedPen = selectedValue ? this.findPenByValue(selectedValue) : null;
        
        this.calculate();
    }

    findPenByValue(value) {
        if (!this.insulinPens) return null;
        
        for (const category of Object.values(this.insulinPens)) {
            if (Array.isArray(category)) {
                const pen = category.find(p => p.value === value);
                if (pen) return pen;
            }
        }
        return null;
    }

    findPenType(value) {
        if (!this.insulinPens) return null;
        
        for (const [type, category] of Object.entries(this.insulinPens)) {
            if (Array.isArray(category)) {
                const pen = category.find(p => p.value === value);
                if (pen) return type;
            }
        }
        return null;
    }

    updateResultsUI() {
        if (this.selectedPen && this.selectedPen.pens_per_box) {
            const values = this.getInputValues();
            const results = this.calculateResults(values);
            
            this.pensPerBoxSpan.textContent = this.selectedPen.pens_per_box;
            
            const penVolumeInUnits = values.concentration * values.volumePerPen;
            const dailyDose = values.unitsPerDose * values.doseFrequency;
            const monthsPerBox = (this.selectedPen.pens_per_box * penVolumeInUnits) / (dailyDose * 30);
            
            // Calculate boxes needed
            const boxesNeeded = Math.ceil(results.pensToOrder / this.selectedPen.pens_per_box);
            const totalPensInBoxes = boxesNeeded * this.selectedPen.pens_per_box;
            
            this.monthsPerBoxSpan.innerHTML = `
                <div><strong>Pens needed:</strong> ${results.pensToOrder}</div>
                <div><strong>Boxes needed:</strong> ${boxesNeeded} (${totalPensInBoxes} total pens)</div>
                <div><strong>Supply per box:</strong> ${Math.round(monthsPerBox * 10) / 10} months</div>
            `;
            
            this.boxInfoDiv.classList.remove('hidden');
        } else {
            this.boxInfoDiv.classList.add('hidden');
        }
    }

    showDisclaimer() {
        this.disclaimerModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    hideDisclaimer() {
        this.disclaimerModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    bindWeightSliderEvents() {
        this.dosingSlider.addEventListener('input', () => this.calculateDoseFromSlider());
        this.patientWeightInput.addEventListener('input', () => this.calculateDoseFromSlider());
        this.weightUnitToggle.addEventListener('click', () => this.toggleWeightUnit());
        
        this.calculateDoseFromSlider();
    }

    calculateDoseFromSlider() {
        const weight = parseFloat(this.patientWeightInput.value);
        const sliderValue = parseInt(this.dosingSlider.value);
        const weightUnit = this.weightUnitToggle.dataset.unit;
        
        const dosingValues = [0.1, 0.2, 0.3];
        const dosingRate = dosingValues[sliderValue] || 0.1;
        
        this.sliderValueSpan.textContent = `${dosingRate} u/kg/day`;
        
        if (weight && weight > 0) {
            let weightInKg = weight;
            if (weightUnit === 'lbs') {
                weightInKg = weight * 0.4536;
            }
            
            const dailyDose = Math.round(weightInKg * dosingRate);
            this.estimatedDoseSpan.textContent = `${dailyDose} units`;
            
            this.setDoseFromWeight(dailyDose);
        } else {
            this.estimatedDoseSpan.textContent = '-';
        }
    }

    setDoseFromWeight(dose) {
        if (dose && dose > 0) {
            this.unitsPerDoseInput.value = dose;
            this.calculate();
        }
    }

    toggleWeightBasedDosing(penType) {
        if (penType === 'basal') {
            this.weightBasedDosingDiv.classList.remove('hidden');
        } else {
            this.weightBasedDosingDiv.classList.add('hidden');
        }
    }

    showPricingInfo(penValue, pen) {
        if (penValue === 'lantus-solostar') {
            this.pricingTextSpan.textContent = '$35/box with GoodRx';
            this.pricingInfoDiv.classList.remove('hidden');
        } else if (penValue === 'toujeo-solostar') {
            this.pricingTextSpan.textContent = '$35/box with GoodRx';
            this.pricingInfoDiv.classList.remove('hidden');
        } else if (penValue === 'admelog-solostar') {
            this.pricingTextSpan.textContent = '$35/box with GoodRx';
            this.pricingInfoDiv.classList.remove('hidden');
        } else if (penValue === 'apidra-solostar') {
            this.pricingTextSpan.textContent = '$35/box with GoodRx';
            this.pricingInfoDiv.classList.remove('hidden');
        } else {
            this.pricingInfoDiv.classList.add('hidden');
        }
    }

    toggleWeightUnit() {
        const currentUnit = this.weightUnitToggle.dataset.unit;
        const newUnit = currentUnit === 'kg' ? 'lbs' : 'kg';
        const currentWeight = parseFloat(this.patientWeightInput.value);
        
        // If there's a weight value, ask for confirmation
        if (currentWeight && currentWeight > 0) {
            const convertedWeight = currentUnit === 'kg' 
                ? Math.round(currentWeight / 0.4536 * 10) / 10  // kg to lbs
                : Math.round(currentWeight * 0.4536 * 10) / 10; // lbs to kg
            
            const message = `Convert ${currentWeight} ${currentUnit} to ${convertedWeight} ${newUnit}?`;
            const options = [
                { text: 'Convert Weight', action: 'convert' },
                { text: 'Clear Weight', action: 'clear' },
                { text: 'Cancel', action: 'cancel' }
            ];
            
            this.showWeightConversionDialog(message, options, (action) => {
                if (action === 'convert') {
                    this.patientWeightInput.value = convertedWeight;
                    this.updateWeightUnit(newUnit);
                } else if (action === 'clear') {
                    this.patientWeightInput.value = '';
                    this.updateWeightUnit(newUnit);
                }
                // For 'cancel', do nothing
            });
        } else {
            // No weight value, just change unit
            this.updateWeightUnit(newUnit);
        }
    }
    
    updateWeightUnit(newUnit) {
        this.weightUnitToggle.dataset.unit = newUnit;
        this.weightUnitToggle.textContent = newUnit;
        this.calculateDoseFromSlider();
    }
    
    showWeightConversionDialog(message, options, callback) {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
        
        // Create dialog
        const dialog = document.createElement('div');
        dialog.className = 'bg-white rounded-lg max-w-sm w-full p-6';
        
        // Add message
        const messageEl = document.createElement('p');
        messageEl.className = 'text-gray-900 mb-4 text-center';
        messageEl.textContent = message;
        dialog.appendChild(messageEl);
        
        // Add buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'space-y-2';
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = option.action === 'convert' 
                ? 'w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                : option.action === 'clear'
                ? 'w-full bg-yellow-600 text-white py-2 px-4 rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500'
                : 'w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500';
            button.textContent = option.text;
            button.addEventListener('click', () => {
                document.body.removeChild(overlay);
                callback(option.action);
            });
            buttonContainer.appendChild(button);
        });
        
        dialog.appendChild(buttonContainer);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                callback('cancel');
            }
        });
    }
    
    setupInputValidation() {
        // Units per dose validation
        this.unitsPerDoseInput.addEventListener('input', (e) => {
            this.validateUnitsPerDose(e.target);
        });
        
        // Day supply validation
        this.daySupplyInput.addEventListener('input', (e) => {
            this.validateDaySupply(e.target);
        });
    }
    
    validateUnitsPerDose(input) {
        const value = parseFloat(input.value);
        
        // Don't validate empty fields (user hasn't entered anything yet)
        if (!input.value || input.value.trim() === '' || isNaN(value) || value <= 0) {
            this.clearValidationError(input);
            return true;
        }
        
        // Reasonable insulin dose bounds
        const minDose = 0.1;
        const maxDose = 200;  // Very high but possible for severe insulin resistance
        
        if (value < minDose || value > maxDose) {
            this.showValidationError(input, `Dose must be between ${minDose}-${maxDose} units`);
            return false;
        }
        
        // Warning for very high doses
        if (value > 100) {
            this.showValidationWarning(input, `High dose (${value} units) - please verify`);
        } else {
            this.clearValidationError(input);
        }
        
        return true;
    }
    
    validateDaySupply(input) {
        const value = parseFloat(input.value);
        
        // Don't validate empty fields or default values
        if (!input.value || input.value.trim() === '' || isNaN(value) || value <= 0) {
            this.clearValidationError(input);
            return true;
        }
        
        // Reasonable day supply bounds
        const minDays = 1;
        const maxDays = 365;
        
        if (value < minDays || value > maxDays) {
            this.showValidationError(input, `Day supply must be between ${minDays}-${maxDays} days`);
            return false;
        }
        
        this.clearValidationError(input);
        return true;
    }
    
    showValidationError(input, message) {
        input.classList.add('border-red-500', 'bg-red-50');
        input.classList.remove('border-gray-300', 'border-yellow-500', 'bg-yellow-50');
        this.showValidationMessage(input, message, 'error');
    }
    
    showValidationWarning(input, message) {
        input.classList.add('border-yellow-500', 'bg-yellow-50');
        input.classList.remove('border-gray-300', 'border-red-500', 'bg-red-50');
        this.showValidationMessage(input, message, 'warning');
    }
    
    clearValidationError(input) {
        input.classList.remove('border-red-500', 'bg-red-50', 'border-yellow-500', 'bg-yellow-50');
        input.classList.add('border-gray-300');
        this.hideValidationMessage(input);
    }
    
    showValidationMessage(input, message, type) {
        this.hideValidationMessage(input);
        
        const messageEl = document.createElement('div');
        messageEl.className = type === 'error' 
            ? 'absolute z-10 text-red-600 text-xs mt-1 validation-message bg-white border border-red-200 rounded px-2 py-1 shadow-lg'
            : 'absolute z-10 text-yellow-600 text-xs mt-1 validation-message bg-white border border-yellow-200 rounded px-2 py-1 shadow-lg';
        messageEl.textContent = message;
        
        // Position the message below the input without affecting layout
        const parentNode = input.parentNode;
        if (!parentNode.style.position) {
            parentNode.style.position = 'relative';
        }
        
        parentNode.appendChild(messageEl);
    }
    
    hideValidationMessage(input) {
        const existingMessage = input.parentNode.querySelector('.validation-message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }
    
    checkPenExpiration(daySupply, pensToOrder) {
        const selectedValue = this.penSelect.value;
        let expirationDays = 84; // Default 84 days for most pens
        
        // Tresiba expires in 56 days
        if (selectedValue === 'tresiba-flextouch') {
            expirationDays = 56;
        }
        
        // Calculate if day supply exceeds pen expiration
        if (daySupply > expirationDays) {
            const pensNeeded = Math.ceil(daySupply / expirationDays);
            return {
                needsMorePens: pensNeeded > pensToOrder,
                recommendedPens: Math.max(pensToOrder, pensNeeded),
                warning: `This pen expires ${expirationDays} days after first use. For ${daySupply} day supply, you need at least ${pensNeeded} pen${pensNeeded > 1 ? 's' : ''} to avoid expiration.`
            };
        }
        
        return { needsMorePens: false, recommendedPens: pensToOrder, warning: null };
    }
    
    checkExpirationWarning(penValue) {
        const daySupply = parseFloat(this.daySupplyInput.value) || 30;
        
        if (penValue === 'tresiba-flextouch' && daySupply > 56) {
            this.showExpirationWarning(`⚠️ Tresiba expires 56 days after first use. Consider multiple pens for ${daySupply} day supply.`);
        } else {
            this.hideExpirationWarning();
        }
    }
    
    showExpirationWarning(message) {
        if (this.expirationWarning) {
            this.expirationWarning.textContent = message;
            this.expirationWarning.classList.remove('hidden');
        }
    }
    
    hideExpirationWarning() {
        if (this.expirationWarning) {
            this.expirationWarning.classList.add('hidden');
        }
    }
}

// Initialize the calculator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new InsulinCalculator();
});