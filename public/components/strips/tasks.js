/**
 * Creates a task navigation strip
 * @param {HTMLElement} container - Container to insert the strip into
 * @param {Object} options - Task options
 * @param {Array<Object>} options.tasks - Array of task data
 * @param {number} options.currentIndex - Current task index
 * @param {Function} options.onChange - Callback when task is changed
 * @returns {Object} The task strip component
 */
export function createOrUpdateTaskStrip(container, options) {
    // Add task-specific classes to container
    container.classList.add('task-actions-container');
    
    const { tasks, currentIndex, onChange } = options;
    
    // Prepare button configurations
    const properties = tasks.map((task, index) => {
        // Define classes
        const classes = ['task-button'];
        if (index === currentIndex) {
            classes.push('active');
        }
        if (!task.accessible) {
            classes.push('disabled');
        }
        if (task.completed) {
            classes.push('done');
        }
        
        // Define click handler (null for disabled properties)
        const onClick = task.accessible ? () => {
            onChange(index);
        } : null;
        
        // Create button configuration
        return {
            label: index + 1, // Numbering starts from 1
            classes: classes,
            tooltip: task.title || `Task ${index + 1}`,
            onClick: onClick
        };
    });
    
    // Create the strip
    const strip = createOrUpdateStrip(container, properties);
    
    // Scroll the active button into view
    strip.scrollClassIntoView('active');
    
    return strip;
}
