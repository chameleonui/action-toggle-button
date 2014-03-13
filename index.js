/**
 * 
 * Action - Toggle Button
 * 
 */

var $ = require('jquery');
var Emitter = require('emitter');

var defaults = {
    method: 'POST',
    callback: function (xhrResponse) {
        return xhrResponse.status >= 200 && xhrResponse.status <= 399;
    },
    states: {
        stateA: {
            content: '<i class="fa fa-star-o"></i>',
            classes: 'button-default',
            nextState: 'stateB',
            title: 'State A'
        },
        stateB: {
            content: '<i class="fa fa-star"></i>',
            classes: 'button-primary',
            nextState: 'stateA',
            title: 'State B'
        },
        XHRrequest: {
            content: '<i class="fa fa-spinner fa-spin"></i>',
            classes: 'button-disabled',
            title: 'Loading ...'
        }
    }
};

function ActionToggleButton(options) {
    this.options = options || {};
    for (var i in defaults) {
        if (!(this.options[i])) this.options[i] = defaults[i];
    }
    this.response = {};
    this.self;
    this.active = 0;
    this.currentState;
    this.nextState;
}

module.exports = ActionToggleButton;

Emitter(ActionToggleButton.prototype);

ActionToggleButton.prototype.init = function(self) {
    
    var component = this;
    component.self = self;

    if (!component.currentState) {
        component.currentState = component.self.getAttribute('data-state') ? component.self.getAttribute('data-state') : 'stateA';
    }

    if (!component.nextState) {
        component.nextState = component.options.states[component.currentState] ? component.options.states[component.currentState].nextState : 'stateB';
    }

    component._stateChange('XHRrequest');
};

ActionToggleButton.prototype._click = function(fn) {
    var component = this;

    $(component.self).on('click.actiontoggle', function(event) {

        event.preventDefault();
        fn(event);
    });
};

ActionToggleButton.prototype._clearEvent = function() {
    
    var component = this;

    $(component.self).off('click.actiontoggle');
};

ActionToggleButton.prototype._stateChange = function(newStateName) {
    
    var component = this,
        previousStateClasses,
        newStateClasses;

    // clear binded event - prevents multiple clicks
    component._clearEvent();

    // replace full class list
    if (component.options.states[newStateName]) {

        previousStateClasses = component.options.states[component.currentState].classes;
        newStateClasses = component.options.states[newStateName].classes;

        component.self.setAttribute('class', newStateClasses);
        component.self.setAttribute('title', component.options.states[newStateName].title);
        component.self.innerHTML = component.options.states[newStateName].content;

        component.currentState = newStateName;
        component[newStateName]();

    } else {

        console.error('State: ' + newStateName + ' does not exist');
    }
};

ActionToggleButton.prototype.stateA = function() {

    var component = this;
    component.nextState = 'stateB';

    component._click(function(){

        component._stateChange('XHRrequest');

    });
};

ActionToggleButton.prototype.stateB = function() {

    var component = this;
    component.nextState = 'stateA';

    component._click(function(){

        component._stateChange('XHRrequest');

    });
};

ActionToggleButton.prototype.XHRrequest = function() {
    
    var component = this;

    component._click(function(){});

    component.active = 1;

    component.emit('request');

    component._xhr(component.self.getAttribute('href'), function(xhr){

        component.response = xhr;
        component._XHRresponse();

    });
};

ActionToggleButton.prototype._XHRresponse = function() {
    
    var component = this;

    component.active = 0;
    
    if ( component.options.callback(component.response) ) {

        component._stateChange(component.nextState ? component.nextState : 'stateB');
        component.emit('success');

    } else {

        component._stateChange(component.nextState ? component.nextState : 'stateA');
        component.emit('error');
    }

    component.emit('response');
};

ActionToggleButton.prototype._xhr = function(setUrl, resFn) {

    $.ajax({
        url: setUrl
    })
    .done(function(data, textStatus, jqXHR) {
        resFn(jqXHR);
    })
    .fail(function(jqXHR, textStatus, errorThrown) {
        resFn(jqXHR);
    });
};
