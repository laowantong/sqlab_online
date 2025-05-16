import { expect } from "chai";

/**
 * Lightweight test function for async functions that should throw an error.
 * https://stackoverflow.com/a/56104568/173003
 * @async
 * @param {Function} method - The async function to test.
 * @param {string} [errorMessage] - Optional expected error message.
 * @returns {Promise<void>} - A promise that resolves if the error is thrown, otherwise rejects.
 */
export const expectThrowsAsync = async (method, errorMessage) => {
    let error = null
    try {
      await method()
    }
    catch (err) {
      error = err
    }
    expect(error).to.be.an('Error')
    if (errorMessage) {
      expect(error.message).to.equal(errorMessage)
    }
  };
