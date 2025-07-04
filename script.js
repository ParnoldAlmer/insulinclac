class InsulinCalculator {
    constructor() {
        this.initializeElements();
        this.bindEvents();
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
        
        this.resultsDiv = document.getElementById('results');
        this.errorDiv = document.getElementById('errorMessage');
        this.totalUnitsSpan = document.getElementById('totalUnits');
        this.totalMLSpan = document.getElementById('totalML');
        this.pensToOrderSpan = document.getElementById('pensToOrder');
        this.prescriptionTextP = document.getElementById('prescriptionText');
        
        this.boxInfoDiv = document.getElementById('boxInfo');
        this.pensPerBoxSpan = document.getElementById('pensPerBox');
        this.monthsPerBoxSpan = document.getElementById('monthsPerBox');
        
        this.insulinPens = null;
        this.selectedPen = null;
        
        this.populateDropdown();
    }

    bindEvents() {
        this.calculateBtn.addEventListener('click', () => this.calculate());
        this.copyBtn.addEventListener('click', () => this.copyPrescription());
        
        this.penSelect.addEventListener('change', (e) => {
            const selectedValue = e.target.value;
            if (selectedValue && this.insulinPens) {
                const selectedPen = this.findPenByValue(selectedValue);
                if (selectedPen) {
                    const penType = this.findPenType(selectedValue);
                    this.setPenValues(selectedPen.concentration, selectedPen.volume, penType);
                }
            }
        });
        
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
        const totalUnits = values.unitsPerDose * values.doseFrequency * values.daySupply;
        
        // Total mL needed = total units ÷ units/mL
        const totalML = totalUnits / values.concentration;
        
        // Pens to order = ceil(total mL ÷ mL per pen)
        const pensToOrder = Math.ceil(totalML / values.volumePerPen);
        
        return {
            totalUnits: Math.round(totalUnits * 100) / 100,
            totalML: Math.round(totalML * 100) / 100,
            pensToOrder
        };
    }

    generatePrescriptionNote(values, results) {
        const insulinType = this.selectedPen ? this.selectedPen.generic : 'insulin';
        const frequency = values.doseFrequency === 1 ? 'daily' : `${values.doseFrequency} times daily`;
        
        return `Order ${results.pensToOrder} pen${results.pensToOrder > 1 ? 's' : ''} of ${insulinType} ${values.concentration} units/mL, use ${values.unitsPerDose} units ${frequency}, ${values.daySupply} day supply`;
    }

    displayResults(results, prescriptionNote) {
        this.totalUnitsSpan.textContent = `${results.totalUnits} units`;
        this.totalMLSpan.textContent = `${results.totalML} mL`;
        this.pensToOrderSpan.textContent = results.pensToOrder;
        this.prescriptionTextP.textContent = prescriptionNote;
        
        this.updateResultsUI();
        
        this.resultsDiv.classList.remove('hidden');
        this.errorDiv.classList.add('hidden');
    }

    displayError(errors) {
        this.errorDiv.querySelector('p').textContent = errors.join('. ');
        this.errorDiv.classList.remove('hidden');
        this.resultsDiv.classList.add('hidden');
        this.boxInfoDiv.classList.add('hidden');
    }

    calculate() {
        const values = this.getInputValues();
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
                        option.textContent = `${pen.brand} - ${pen.generic} (${pen.concentration} U/mL, ${pen.volume} mL)`;
                        optgroup.appendChild(option);
                    });
                    
                    this.penSelect.appendChild(optgroup);
                }
            });
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
            
            this.pensPerBoxSpan.textContent = this.selectedPen.pens_per_box;
            
            const penVolumeInUnits = values.concentration * values.volumePerPen;
            const dailyDose = values.unitsPerDose * values.doseFrequency;
            const monthsPerBox = (this.selectedPen.pens_per_box * penVolumeInUnits) / (dailyDose * 30);
            
            this.monthsPerBoxSpan.textContent = Math.round(monthsPerBox * 10) / 10 + ' months';
            
            this.boxInfoDiv.classList.remove('hidden');
        } else {
            this.boxInfoDiv.classList.add('hidden');
        }
    }
}

// Initialize the calculator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new InsulinCalculator();
});