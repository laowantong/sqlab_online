
/**
 * Stakes a certain percentage of the score on a query and check its validity.
 * NB. We don't trust the client to send a stake amount, which could be manipulated.
 *     The server store the score and expect a percentage. It will check that this
 *     percentage is within MIN_STAKE_PERCENTAGE and MAX_STAKE_PERCENTAGE.
 *    
 * @param {string} query - The SQL query to be checked.
 * @param {number} activityNumber - The activity number associated with the query.
 * @param {number} taskNumber - The task number associated with the query.
 * @param {number} stakePercentage - The percentage of the score to stake on the query.
 * @returns {Promise<Object>} - A promise that resolves to an object containing the check result.
 */

export async function checkQuery(query, activityNumber, taskNumber, stakePercentage) {
    const response = await fetch('/check-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, activityNumber, taskNumber, stakePercentage })
    });

    // If the request failed, throw an error with the message from the backend
    if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || errorData.message || window.i18n.t('database.checkError', { status: response.status });
        throw new Error(errorMessage);
    }

    return response.json(); // A JavaScript object with the check result
}
