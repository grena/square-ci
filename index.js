const CIRCLECI_API_TOKEN = '';

// TODO: FAUDRA TROUVER
setTimeout(function() {
    const actions = document.getElementsByClassName('status-actions');
    let workflowIds = [];

    for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        const href = action.getAttribute('href');

        if (href.startsWith('https://circleci.com/workflow-run/')) {
            const workflowId = href
                .replace('https://circleci.com/workflow-run/', '')
                .split('?')[0];

            workflowIds.push(workflowId);
        }
    }

    const uniqueWorkflowIds = Array.from(new Set(workflowIds));

    // create a button for each uniqueWorkflowIds
    for (let i = 0; i < uniqueWorkflowIds.length; i++) {
        const workflowId = uniqueWorkflowIds[i];

        const button = document.createElement('button');
        button.innerText = 'Retry';
        button.classList.add('retry-button');
        button.setAttribute('data-workflow-id', workflowId);

        button.addEventListener('click', function(event) {
            const workflowId = event.target.getAttribute('data-workflow-id');

            fetch('https://circleci.com/api/v2/workflow/' + workflowId + '/job', {
                method: 'GET',
                headers: {
                    'Circle-Token': CIRCLECI_API_TOKEN,
                    'Content-Type': 'application/json'
                },
            }).then(function(response) {
                console.log('response', response);
                response.json().then((data) => console.log(data))
            });
        });

        // Status: "on_hold", type: "approval"

        document.body.appendChild(button);
    }

}, 3500);
