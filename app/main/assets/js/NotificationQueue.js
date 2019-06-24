module.exports = class NotificationQueue {
    constructor() {
        this.notifications = []
    }

    enqueue(notification) {
        this.notifications.push(notification)
    }

    dequeue() {
        if(!this.isEmpty()) {
            this.notifications.shift().close()
        }
    }

    front() {
        return this.notifications[0]
    }

    isEmpty() {
        return this.notifications.length === 0;
    }
}