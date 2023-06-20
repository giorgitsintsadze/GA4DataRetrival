document.addEventListener('DOMContentLoaded', () => {
    const reportForm = document.getElementById('reportForm');
    const reportContainer = document.getElementById('reportContainer');

    reportForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const dateRangeSelect = document.getElementById('dateRange');
        const dateRange = dateRangeSelect.value;

        try {
            const response = await fetch(`/report?dateRange=${dateRange}`);
            const data = await response.json();
            reportContainer.innerText = data.reportData;
        } catch (error) {
            console.error(error);
            reportContainer.innerText = 'Failed to generate the report.';
        }
    });
});

