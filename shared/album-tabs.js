document.querySelectorAll('.version-toggle').forEach((toggle) => {
    const tabs = toggle.querySelectorAll('.version-tab');
    const scope = toggle.closest('.container') || document;
    const contents = scope.querySelectorAll('.version-content');

    if (!tabs.length || !contents.length) {
        return;
    }

    tabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            tabs.forEach((item) => item.classList.remove('active'));
            contents.forEach((content) => content.classList.remove('active'));

            tab.classList.add('active');

            const versionId = tab.getAttribute('data-version');
            if (!versionId) {
                return;
            }

            const target = scope.querySelector(`#${versionId}`) || document.getElementById(versionId);
            if (target) {
                target.classList.add('active');
            }
        });
    });
});