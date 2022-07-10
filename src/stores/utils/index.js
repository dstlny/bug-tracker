/* eslint-disable */

const getPriorityColour = (priority) => {
  switch (priority.toLowerCase()) {
    case 'low':
      return 'green'
    case 'medium':
      return 'orange'
    case 'high':
      return 'red'
  }
}
const getStatusColour = (status) => {
  switch (status.toLowerCase()) {
    case 'closed':
      return 'red'
    case 'open':
      return 'blue'
  }
}

const sortByDate = (rowA, rowB, dateField) => {
  return rowA[dateField] - rowB[dateField]
}

const isDevServer = process.env.NODE_ENV === 'development'

export {
  getPriorityColour,
  getStatusColour,
  sortByDate,
  isDevServer
}
