
/**
 * Function to stake a certain amount on a query and check its validity.
 * @param {string} query - The SQL query to be checked.
 * @param {number} activityNumber - The activity number associated with the query.
 * @param {number} taskNumber - The task number associated with the query.
 * @param {number} stakeAmount - The amount to stake on the query.
 * @returns {Promise<Object>} - A promise that resolves to the response from the server.
 * 
 * TODO: don't trust the client to send a stake amount.
 * Instead, store the score server-side, expect a percentage  and check it is
 * within MIN_STAKE_PERCENTAGE and MAX_STAKE_PERCENTAGE.
 */

export async function checkQuery(query, activityNumber, taskNumber, stakeAmount) {
    const response = await fetch('/check-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, activityNumber, taskNumber, stakeAmount })
    });

    // If the request failed, throw an error with the message from the backend
    if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || window.i18n.t('database.checkError', { status: response.status }));
    }

    return response.json();
}