$(document).ready(()=>{
    $('.wizard-steps').wizard_steps({
        gradient: true,
        validate_step: true,
        onNextStep: function() {
            return true;
        }
    });
});