document.addEventListener('DOMContentLoaded', () => {
    const reportForm = document.getElementById('reportForm');
    const reportContainer = document.getElementById('reportContainer');
    const loader = document.getElementById('loader');

    reportForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const dateRangeSelect = document.getElementById('dateRange');
        const dateRange = dateRangeSelect.value;

        try {
            // Show the loader
            loader.style.display = 'block';

            const response = await fetch(`/report?dateRange=${dateRange}`);
            const data = await response.json();
            reportContainer.innerText = data.reportData;

            // Hide the loader
            loader.style.display = 'none';
        } catch (error) {
            console.error(error);
            reportContainer.innerText = 'Failed to generate the report.';

            // Hide the loader
            loader.style.display = 'none';
        }
    });
});
