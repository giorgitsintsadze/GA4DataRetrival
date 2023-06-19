document.addEventListener('DOMContentLoaded', () => {
    const reportForm = document.getElementById('reportForm');
    const reportContainer = document.getElementById('reportContainer');

    reportForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;
        try {
            const response = await fetch(`/report?startDate=${startDate}&endDate=${endDate}`);
            const data = await response.json();
            reportContainer.innerText = data.reportData;
        } catch (error) {
            console.error(error);
            reportContainer.innerText = 'Failed to generate the report.';
        }
    });
});
