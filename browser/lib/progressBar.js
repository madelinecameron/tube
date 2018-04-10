'use strict'

const html = require('choo/html')

module.exports = (steps) => {
  return (state, emit) => {

    if (!state.progressTracker) {
      state.progressTracker = {
        highestCompleted: 0
      }
    }

    const goToPage = (index) => {
      return () => {
        // You can only travel to pages you've completed
        if (state.progressTracker.highestCompleted >= index) {

          // Store current step's values
          const currentStepValues = {}

          steps[state.currentStep] = currentStepValues

          state.currentStep = index

          emit('render')
        }
      }
    }

    /**
     * Takes in step object and what the index of the step is
     *
     * @param  {Object} step  Describes the step
     * @param  {Number} index What number step it is
     * @return {HTML}
     */

    const createBubble = (step, index) => {
      return html`
        <div class="col-md-1 align-center justify-center items-center" onclick=${goToPage(index)}>
          <div class="flex justify-center pb3">
            <i class="fal ${state.currentStep  > index ? 'fa-check-circle' : 'fa-circle'}" data-fa-transform="grow-6"></i>
          </div>
          <div class="flex flex-column justify-center items-center">
            <div class="text-uppercase text-center f7">
              <div>Step ${index + 1}</div>
            </div>
            <div class="text-center b">
              ${step.name}
            </div>
          </div>
        </div>
      `
    }
    return html`
      <div class="container flex justify-center items-center">
        <div class="row flex justify-between w-25">
          ${(() => {
            // Get all the bubbles to create
            return steps.map(createBubble)
          })()}
        </div>
      </div>
    `
  }
}