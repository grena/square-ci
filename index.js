// TODO: Use a background script to provides this function for all
const getCircleCiApiToken = async () => {
  const storageData = await browser.storage.sync.get();

  const circleCiApiToken = storageData.CIRCLECI_API_TOKEN;

  if(undefined === circleCiApiToken) {
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

const fetchWorkflow = async (workflowId) => {
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

const renderButton = (onClick) => {
  const button = document.createElement('button');
  button.innerText = 'Retry';
  button.classList.add('retry-button');
  button.addEventListener('click', onClick);
  document.body.appendChild(button);
};

// TODO: FAUDRA TROUVER @ValentinMumble
setTimeout(async () => {
  const workflowIds = getWorkflowIds();

  workflowIds.forEach(workflowId => {
      renderButton(async () => {
          const workflow = await fetchWorkflow(workflowId);
          console.log(workflow);
      });
  });
}, 3500);
