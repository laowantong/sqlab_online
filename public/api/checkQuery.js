
/**
 */

export async function checkQuery(query, activityNumber, taskNumber) {
    const response = await fetch('/check-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, activityNumber, taskNumber })
    });

    // If the request failed, throw an error with the message from the backend
    if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || window.i18n.t('database.checkError', { status: response.status }));
    }

    return response.json();
}