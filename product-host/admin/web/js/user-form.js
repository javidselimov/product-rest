document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('user-manage-form');
    if (!form) return;
    const submitBtn = form.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    const originalData = {};
    form.querySelectorAll('input, select, textarea').forEach(function (el) {
        if (!el.name) return;
        if (el.type === 'checkbox' || el.type === 'radio') {
            originalData[el.name] = el.checked;
        } else {
            originalData[el.name] = el.value;
        }
    });

    function checkChanges() {
        let changed = false;
        form.querySelectorAll('input, select, textarea').forEach(function (el) {
            if (!el.name) return;
            if (el.type === 'checkbox' || el.type === 'radio') {
                if (originalData[el.name] !== el.checked) changed = true;
            } else {
                if (originalData[el.name] !== el.value) changed = true;
            }
        });
        submitBtn.disabled = !changed;
    }

    form.querySelectorAll('input, select, textarea').forEach(function (el) {
        el.addEventListener('input', checkChanges);
        el.addEventListener('change', checkChanges);
    });

    checkChanges(); // начальная проверка
});