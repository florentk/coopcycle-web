import React from 'react'
import { findDOMNode } from 'react-dom'
import { connect } from 'react-redux'
import dragula from 'dragula'
import { assignTasks, updateTask } from './store/actions'
import TaskList from './components/TaskList'
import UserPanelList from './components/UserPanelList'
import _ from 'lodash'

const drake = dragula({
  copy: true,
  copySortSource: false,
  revertOnSpill: true,
  accepts: (el, target, source, sibling) => target !== source
})
.on('drag', function(el, source) {
  let elements = []
  if (el.hasAttribute('data-link')) {
    const siblings = Array.from(el.parentNode.childNodes)
    elements = _.filter(siblings, sibling => sibling.getAttribute('data-link') === el.getAttribute('data-link'))
  } else {
    elements = [ el ]
  }
  elements.forEach(el => el.classList.add('task__draggable--dragging'))
})
.on('cloned', function (clone, original) {
  clone.classList.remove('task__draggable--dragging')
})
.on('over', function (el, container, source) {
  if ($(container).hasClass('dropzone')) {
    $(container).addClass('dropzone--over')
  }
})
.on('out', function (el, container, source) {
  if ($(container).hasClass('dropzone')) {
    $(container).removeClass('dropzone--over')
  }
})

/**
 * Code to handle drag and drop from unassigned tasks to assigned
 */
function configureDrake(unassignedTasksContainer, allTasks, assignTasks) {

  drake
    .on('dragend', function (el) {
      Array.from(unassignedTasksContainer.querySelectorAll('.task__draggable--dragging'))
        .forEach(el => el.classList.remove('task__draggable--dragging'))
    })
    .on('drop', function(element, target, source) {

      const username = $(target).data('username')
      const isTask = element.hasAttribute('data-task-id')
      const elements = isTask ? [ element ] : Array.from(element.querySelectorAll('[data-task-id]'))

      let tasks = elements.map(el => _.find(allTasks, task => task['@id'] === el.getAttribute('data-task-id')))

      // Make sure linked tasks are assigned too
      const tasksWithLink = _.filter(tasks, task => task.hasOwnProperty('link'))
      if (tasksWithLink.length > 0) {
        const links = tasksWithLink.map(task => task.link)
        const linkedTasks = _.filter(allTasks, task => task.hasOwnProperty('link') && _.includes(links, task.link))
        linkedTasks.forEach(task => tasks.push(task))
        tasks = _.uniqBy(tasks, '@id')
      }

      assignTasks(username, tasks)

      $(target).removeClass('dropzone--loading')

      // Remove cloned element from dropzone
      element.remove()
    })

}

class DashboardApp extends React.Component {

  componentDidMount() {
    this.props.socket.on('task:done', data => this.props.updateTask(data.task))
    this.props.socket.on('task:failed', data => this.props.updateTask(data.task))

    const unassignedTasksContainer = findDOMNode(this.refs.unassignedTasks).querySelector('.list-group')
    drake.containers.push(unassignedTasksContainer)

    configureDrake(unassignedTasksContainer, this.props.allTasks, this.props.assignTasks)
  }

  render () {
    return (
      <div className="dashboard__aside-container">
        <TaskList ref="unassignedTasks" />
        <UserPanelList
          couriersList={ window.AppData.Dashboard.couriersList }
          onLoad={ el => drake.containers.push(el) } />
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    allTasks: state.allTasks
  }
}

function mapDispatchToProps (dispatch) {
  return {
    assignTasks: (username, tasks) => { dispatch(assignTasks(username, tasks)) },
    updateTask: (task) => { dispatch(updateTask(task)) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DashboardApp)