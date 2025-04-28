async function handleSubmit(event) {
    event.preventDefault();
    try {
        // ...existing code...
        const response = await Axios.request({
            // ...existing code...
        });
        // ...existing code...
    } catch (error) {
        console.error("Error occurred:", error);
        if (error.response) {
            // Server responded with a status code outside the 2xx range
            console.error("Response data:", error.response.data);
            console.error("Response status:", error.response.status);
            console.error("Response headers:", error.response.headers);
            alert(`Error: ${error.response.data.message || "Internal Server Error"}`);
        } else if (error.request) {
            // Request was made but no response received
            console.error("Request data:", error.request);
            alert("Error: No response from server. Please try again later.");
        } else {
            // Something else happened
            console.error("Error message:", error.message);
            alert("Error: An unexpected error occurred.");
        }
    }
}