// TODO: Use a background script to provides this function for all
const getCircleCiApiToken = async () => {
    const storageData = await browser.storage.sync.get();

    const circleCiApiToken = storageData.CIRCLECI_API_TOKEN;

    if (undefined === circleCiApiToken) {
        return null;
    }
    return circleCiApiToken;
};

const getWorkflowIds = () => {
    const actions = document.getElementsByClassName('status-actions');
    const hrefs = Array.from(actions).map(action => action.getAttribute('href'));
    const circleCiHrefs = hrefs.filter(href => href.startsWith('https://circleci.com/workflow-run/'));
    const workflowIds = circleCiHrefs.map(href => href.replace('https://circleci.com/workflow-run/', '').split('?').shift());
    return Array.from(new Set(workflowIds));
};

const fetchWorkflowJobs = async (workflowId) => {
    const url = `https://circleci.com/api/v2/workflow/${workflowId}/job`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Circle-Token': await getCircleCiApiToken(),
            'Content-Type': 'application/json',
        },
    });
    return response.ok ? await response.json() : null;
};

const fetchWorkflow = async (workflowId) => {
    const url = `https://circleci.com/api/v2/workflow/${workflowId}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Circle-Token': await getCircleCiApiToken(),
            'Content-Type': 'application/json',
        },
    });
    return response.ok ? await response.json() : null;
};

const approveStep = async (workflow, step) => {
    const url = `https://circleci.com/api/v2/workflow/${workflow.id}/approve/${step.approval_request_id}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Circle-Token': await getCircleCiApiToken(),
            'Content-Type': 'application/json',
        },
    });

    return response.ok ? await response.json() : null;
}

const renderButton = (onClick, parent, label) => {
    const button = document.createElement('button');
    button.innerText = label;
    button.classList.add('retry-button', 'btn');
    button.addEventListener('click', onClick);
    parent.appendChild(button);
};

async function refreshButtons() {
    const workflowIds = getWorkflowIds();

    // TODO: mettre ces workflows parametrables ?
    const enabledWorflowNames = [
        'raccoon_tailored_import_pull_request',
        'raccoon_job_automation_pull_request'
    ];

    const workflowDiv = document.createElement('div');
    workflowDiv.id = 'squareci';

    for (const workflowId of workflowIds) {
        const workflow = await fetchWorkflow(workflowId);

        if (!enabledWorflowNames.includes(workflow.name)) continue;

        const jobs = await fetchWorkflowJobs(workflowId);
        const approvalSteps = jobs.items.filter(item => item.type === 'approval' && item.status === 'on_hold');

        for (const approvalStep of approvalSteps) {
            renderButton(() => {
                approveStep(workflow, approvalStep);
                refreshButtons();
            }, workflowDiv, workflow.name + ' - ' + approvalStep.name);
        }
    }

    document.getElementById('squareci')?.remove();
    document.getElementById('issue-comment-box').parentElement.insertBefore(workflowDiv, document.getElementById('issue-comment-box'));
}

// TODO: FAUDRA TROUVER @ValentinMumble
setTimeout(async () => {
    await refreshButtons();
}, 3500);
