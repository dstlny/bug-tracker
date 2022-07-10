/* eslint-disable */

function sortBy(array, field, descending) {
  if (descending) {
    array.sort((a, b) => b[field] - a[field]);
  } else {
    array.sort((a, b) => a[field] - b[field]);
  }
}

const Colors = [
  "red",
  "pink",
  "purple",
  "blue",
  "light-blue",
  "cyan",
  "teal",
  "green",
  "light-green",
  "lime",
  "yellow",
  "amber",
  "orange",
  "deep-orange",
  "brown",
  "grey",
  "blue-grey"
]

class Badge {

  /** @type {Number} */
  id

  /** @type {String} */
  label

  /** @type {String} */
  color

  /**
   * Create a Organisation.
   * @param Object({label, color}) - The raw Badge
   */
  constructor({ id, label, color }) {
    this.id = id
    this.label = label
    this.color = color
  }


}

/** Class representing a Organisation. */
class Organisation {

  /** @type {Number} */
  id

  /** @type {String} */
  name

  /** @type {Boolean} */
  is_internal = true

  /** @type {AuditTrail[]} */
  audit_trails

  /** @type {Project[]} */
  projects

  /**
   * Create a Organisation.
   * @param Object({id, name, is_internal, audit_trails, projects}) - The raw organisation
   */
  constructor({ id, name, is_internal, audit_trails, projects }) {
    this.id = id
    this.name = name
    this.is_internal = is_internal
    this.setAuditTrails({ audit_trails })
    this.setProjects({ projects })
  }

  setAuditTrails({ audit_trails }) {

    this.audit_trails = []

    if (audit_trails) {
      this.audit_trails = audit_trails.map(entry => new AuditTrail(entry))
    }
  }

  setProjects({ projects }) {

    this.projects = []

    if (projects) {
      const already_converted = projects.some(entry => entry instanceof Project)

      if (already_converted) {
        this.projects = projects
      } else {
        this.projects = projects.map(entry => new Project(entry))
      }
    }
  }

}

/** Class representing a User object. */
class User {

  /** @type {Number} */
  id

  /** @type {String} */
  username

  /**
   * Create a User.
   * @param Object({id, username}) - The raw User
  */
  constructor({ id, username }) {
    this.id = id
    this.username = username
  }

  equals(other) {
    return this.id === other.id
  }

}

/** Class representing a Comment object. */
class Comment {

  /** @type {Number} */
  id

  /** @type {String} */
  content

  /** @type {User} */
  author

  /** @type {Number} */
  project_id

  /** @type {Number} */
  bug_id

  /** @type {Date} */
  date_created

  /** @type {Date} */
  date_updated

  /**
   * Create a User.
   * @param Object({id, content, author, project_id, bug_id, date_created, date_updated}) - The raw Comment
  */
  constructor({ id, content, author, project_id, bug_id, date_created, date_updated }) {
    this.id = id
    this.content = content
    this.author = new User(author)
    this.project_id = project_id
    this.bug_id = bug_id
    this.date_created = new Date(date_created)
    this.date_updated = new Date(date_updated)
  }

}

/**
 * Class representing a Thread object.
 * @augments Comment
 */
class Thread extends Comment {

  /** @type {ThreadReply[]} */
  replies

  constructor(props) {
    super(props)
    this.setThreadReplies({ replies: props.threadreplys })
  }

  setThreadReplies({ replies }) {
    this.replies = []

    if (replies) {
      this.replies = replies.map(entry => new ThreadReply(entry))
      sortBy(this.replies, 'date_created', true)
    }

  }

}

/**
 * Class representing a Reply to a Thread object.
 * @augments Comment
 */
class ThreadReply extends Comment {

  constructor(props) {
    super(props)
  }

}

/** Class representing a Bug object. */
class Bug {

  /** @type {Number} */
  id

  /** @type {String} */
  content

  /** @type {User} */
  owner

  /** @type {'Closed' | 'Open'} */
  status

  /** @type {'Low' | 'Medium' | 'High'} */
  priority

  /** @type {Comment[]} */
  comments

  /** @type {AuditTrail[]} */
  audit_trails

  /** @type {Thread[]} */
  threads

  /** @type {User[]} */
  allocated_to

  /** @type {Badge[]} */
  badges

  /** @type {Date} */
  date_created

  /** @type {Date} */
  date_updated

  constructor({ id, content, status, priority, owner, date_created, date_updated, comments, audit_trails, threads, allocated_to, badges }) {
    this.id = id
    this.content = content
    this.status = status
    this.priority = priority
    this.owner = new User(owner)
    this.date_created = new Date(date_created)
    this.date_updated = new Date(date_updated)
    this.setComments({ comments })
    this.setAuditTrails({ audit_trails })
    this.setThreads({ threads })
    this.setAllocatedUsers({ allocated_to })
    this.setBadges({ badges })
  }

  setComments({ comments }) {

    this.comments = []

    if (comments) {
      this.comments = comments.map(entry => new Comment(entry))
      sortBy(this.comments, 'date_created', true)
    }
  }

  setAuditTrails({ audit_trails }) {

    this.audit_trails = []

    if (audit_trails) {
      this.audit_trails = audit_trails.map(entry => new AuditTrail(entry))
    }
  }

  setThreads({ threads }) {
    this.threads = []
    if (threads) {
      this.threads = threads.map(entry => new Thread(entry))
      sortBy(this.threads, 'date_created', true)
    }
  }

  setAllocatedUsers({ allocated_to }) {
    this.allocated_to = []

    if (allocated_to) {
      this.allocated_to = allocated_to.map(entry => new User(entry))
    }
  }

  setBadges({ badges }) {
    this.badges = []

    if (badges) {
      this.badges = badges.map(entry => new Badge(entry))
    }
  }

}


/** Class representing a AuditTrail object. */
class AuditTrail {

  /** @type {String} */
  object_class

  /** @type {Number} */
  object_id

  /** @type {String} */
  object_comment

  /** @type {Date} */
  date_created

  constructor({ object_class, object_id, object_comment, date_created }) {
    this.object_class = object_class
    this.object_id = object_id
    this.object_comment = object_comment
    this.date_created = new Date(date_created)
  }

}

class Document {

  /** @type {Number} */
  id

  /** @type {String} */
  original_name

  /** @type {String} */
  public_path

  constructor({ id, original_name, public_path }) {
    this.id = id
    this.original_name = original_name
    this.public_path = public_path
  }

}

/** Class representing a Project object. */
class Project {

  /** @type {Number} */
  id

  /** @type {String} */
  name

  /** @type {User} */
  author

  /** @type {'Closed' | 'Open'} */
  status

  /** @type {'Low' | 'Medium' | 'High'} */
  priority

  /** @type {Organisation} */
  client

  /** @type {Comment[]} */
  comments

  /** @type {Bug[]} */
  bugs

  /** @type {Thread[]} */
  threads

  /** @type {AuditTrail>[]} */
  audit_trails

  /** @type {Badge[]} */
  badges

  /** @type {Number} */
  bug_count

  /** @type {Number} */
  comment_count

  /** @type {Boolean} */
  is_internal = true

  constructor({
    id,
    name,
    author,
    priority,
    status,
    client,
    comments,
    comment_count,
    bugs,
    bug_count,
    audit_trails,
    threads,
    badges,
    documents
  }) {
    this.id = id
    this.name = name
    this.status = status != null ? status : 'Open'
    this.priority = priority != null ? priority : 'Low'

    this.author = new User(author)
    this.client = new Organisation(client)
    this.is_internal = this.client.is_internal

    this.comment_count = comment_count || 0

    this.setComments({ comments })
    this.setBugs({ bugs })
    this.setAuditTrails({ audit_trails })
    this.setThreads({ threads })
    this.setBadges({ badges })
    this.setDocuments({ documents })

    this.bug_count = bug_count || 0
  }


  setComments({ comments }) {
    this.comments = []

    if (comments) {
      this.comments = comments.map(entry => new Comment(entry))
    }
  }

  setBugs({ bugs }) {
    this.bugs = []

    if (bugs) {
      this.bugs = bugs.map(entry => new Bug(entry))
      sortBy(this.bugs, 'date_created', true)
      this.b_count = this.bugs.length
    }
  }

  setAuditTrails({ audit_trails }) {
    this.audit_trails = []

    if (audit_trails) {
      this.audit_trails = audit_trails.map(entry => new AuditTrail(entry))
    }
  }

  setCommentsForBug({ bug_id, comments }) {
    const bug = this.bugs.find(bug => bug.id === bug_id)

    if (comments) {
      bug.setComments({ comments })
    }
  }

  setAuditTrailsForBug({ bug_id, audit_trails }) {
    const bug = this.bugs.find(bug => bug.id === bug_id)

    if (audit_trails) {
      bug.setAuditTrails({ audit_trails })
    }
  }

  setThreadsForBug({ bug_id, threads }) {
    const bug = this.bugs.find(bug => bug.id === bug_id)

    if (threads) {
      bug.setThreads({ threads })
    }
  }

  setRepliesForBugThread({ bug_id, thread_id, replies }) {
    const bug = this.bugs.find(bug => bug.id === bug_id)
    const thread = bug.threads.find(thread => thread.id === thread_id)

    if (thread) {
      thread.setThreadReplies({ replies })
    }
  }

  setThreads({ threads }) {
    this.threads = []

    if (threads) {
      this.threads = threads.map(entry => new Thread(entry))
    }
  }

  setThreadReplies({ thread_id, replies }) {
    const thread = this.threads.find(thread => thread.id === thread_id)

    if (thread) {
      thread.setThreadReplies({ replies })
    }
  }

  setBadges({ badges }) {
    this.badges = []

    if (badges) {
      this.badges = badges.map(entry => new Badge(entry))
    }
  }

  setDocuments({ documents }) {
    this.documents = []

    if (documents) {
      this.documents = documents.map(entry => new Document(entry))
    }
  }

}

export default {
  Project,
  Bug,
  Comment,
  User,
  Organisation,
  AuditTrail,
  Thread,
  ThreadReply,
  Badge,
  Colors
}
