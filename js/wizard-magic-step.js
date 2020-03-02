(function ($) {

    let wizarMagicSteps_Settings = {
        "gradient": false,
        "color": "blue",
        "validate_step": false
    };
    let onNextStep = null;

    let WizardPlugin = function (btn, options) {
        wizarMagicSteps_Settings.color = typeof options.color === 'string' ? options.color : 'blue';
        wizarMagicSteps_Settings.gradient = typeof options.gradient === "boolean" ? options.gradient : false;
        wizarMagicSteps_Settings.validate_step = typeof options.validate_step === 'boolean' ? options.validate_step : false;
        onNextStep = typeof options.onNextStep === 'function' ? options.onNextStep : function () {
        };

        _init();
        _createButtons();
        _manageSteps();
        _manageNavigatorButtons();
    };

    $.fn.wizard_steps = function (options, callback) {
        if (typeof options === 'object') {
            let wizardPlugin = $(this).data('WizardPlugin');
            if (wizardPlugin === undefined) {
                let thisPlugin = new WizardPlugin($(this), options, callback);
                $(this).data('WizardPlugin', thisPlugin);
                return thisPlugin;
            } else {
                return false;
            }
        } else return false;
    };

    let steps = [];
    let config = {
        "total_steps": 0,
        "current_step": 1,
        "validate_step": 1
    };

    function _manageSteps() {
        $.each(steps, i => {
            if (i === config.current_step - 1) {
                steps[i].style.display = 'block';
            } else {
                steps[i].style.display = 'none';
            }
        });
    }

    function getSteps() {
        return document.getElementsByClassName('step-item');
    }

    function _init() {
        steps = getSteps();
        config.total_steps = steps.length;
        if (wizarMagicSteps_Settings.validate_step !== false) {
            let validate_cookie = _getCookie('validate_step');
            config.validate_step = validate_cookie || 1;
        } else {
            config.validate_step = config.total_steps;
        }

        let current_step = _getCookie('current_step');
        config.current_step = (current_step !== config.current_step && current_step) ? current_step : 1;
    }

    function _changeStep(s, type = null) {
        if (type === 'next' &&
            config.validate_step + 1 <= config.total_steps &&
            config.validate_step === config.current_step) {
            config.validate_step = config.validate_step + 1;
        }
        _setCookie(parseInt(s), config.validate_step);
        config.current_step = parseInt(s);
        _manageSteps();
        _manageNavigatorButtons();
    }

    function _manageNavigatorButtons() {
        let color = wizarMagicSteps_Settings.color;
        if (wizarMagicSteps_Settings.gradient) {
            color += '_gradient';
        }

        let navigationButtons = document.getElementsByClassName('ws_steps_link');

        for (let i = 0; i < navigationButtons.length; i++) {
            navigationButtons[i].classList.remove('ws_shadow');
            if (config.current_step === i + 1) {
                navigationButtons[i].classList.add('ws_shadow');
            }
            if (i + 1 <= config.validate_step) {
                navigationButtons[i].classList.remove('ws_no_active');
                navigationButtons[i].classList.add(color)
            }
        }

        let previous_style = 'visible';
        if (config.current_step === 1) {
            previous_style = 'hidden';
        }
        document.getElementsByClassName('wz-previous')[0].style.visibility = previous_style;

        let next_style = 'visible';
        if (config.current_step === config.total_steps) {
            next_style = 'hidden';
        }
        document.getElementsByClassName('wz-next')[0].style.visibility = next_style;
    }

    function _createButtons() {

        let color = wizarMagicSteps_Settings.color;
        if (wizarMagicSteps_Settings.gradient) {
            color += '_gradient';
        }

        let div = document.createElement('div');

        div.classList.add('ws_div_content');

        for (let i = 0; i < config.total_steps; i++) {

            let a = document.createElement('a');

            a.classList.add('ws_steps_link');

            if (i <= config.validate_step - 1) {
                a.classList.add(color);
            } else {
                a.classList.add('ws_no_active');
            }

            a.setAttribute('data-step', i + 1)
            a.addEventListener('click', (e) => {
                if (!e.target.className.includes('ws_no_active')) {
                    let id = e.target.getAttribute('data-step');
                    if (parseInt(id) !== config.current_step) {
                        _changeStep(id);
                    }
                }
            });

            a.href = 'javascript:;';
            a.text = (i + 1).toString();

            div.appendChild(a);

            if (i < config.total_steps - 1) {
                let span = document.createElement('span');
                span.classList.add('ws_span_separator');
                span.classList.add('blue_span');
                div.appendChild(span);
            }
        }
        let buttons = document.getElementsByClassName('wizard-steps')[0];

        buttons.appendChild(div);

        let directions_buttons = document.createElement('div');
        let previous_btn = document.createElement('div');
        let next_btn = document.createElement('div');

        directions_buttons.classList.add('ws-directions');
        previous_btn.classList.add('wz-previous');
        next_btn.classList.add('wz-next');

        let a_prev = document.createElement('a');
        let a_next = document.createElement('a');

        a_prev.text = 'previous';
        a_prev.href = 'javascript:;';
        a_prev.classList.add(color);
        a_prev.addEventListener('click', () => {
            if (config.current_step - 1 > 0) {
                _changeStep(config.current_step - 1);
            }
        });

        a_next.text = 'next';
        a_next.href = 'javascript:;';
        a_next.classList.add(color);
        a_next.addEventListener('click', () => {
            if (onNextStep.name !== '') {
                let nextStep = onNextStep.call();
                if (nextStep) {
                    if (config.current_step + 1 <= config.total_steps)
                        _changeStep(config.current_step + 1, 'next');
                }
            } else {
                if (config.current_step + 1 <= config.total_steps) {
                    _changeStep(config.current_step + 1, 'next');
                }
            }
        });

        previous_btn.appendChild(a_prev);
        next_btn.appendChild(a_next);

        directions_buttons.appendChild(previous_btn);
        directions_buttons.appendChild(next_btn);
        document.getElementsByClassName('wizard-steps-container')[0].appendChild(directions_buttons);
    }

    function _setCookie(current_step, validate_step) {
        document.cookie = "current_step=" + current_step + ";";
        document.cookie = "validate_step=" + validate_step + ";";
    }

    function _getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

}(jQuery));