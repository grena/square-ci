// TODO: Use a background script to provides this function for all
const getCircleCiApiToken = async () => {
  const storageData = await browser.storage.sync.get();

  const circleCiApiToken = storageData.CIRCLECI_API_TOKEN;

  if(undefined === circleCiApiToken) {
    return null;
  }
  return circleCiApiToken;
};

const CIRCLE_CI_API_TOKEN_INPUT_ID = '#circleCiApiToken';

const initialize = async () => {
  console.log(await getCircleCiApiToken());
  document.querySelector(CIRCLE_CI_API_TOKEN_INPUT_ID).value = await getCircleCiApiToken() ?? '';
};

const handleSubmit = async (e) => {
  e.preventDefault();
  console.log(document.querySelector(CIRCLE_CI_API_TOKEN_INPUT_ID).value)
  await browser.storage.sync.set({
    CIRCLECI_API_TOKEN: document.querySelector(CIRCLE_CI_API_TOKEN_INPUT_ID).value,
  });
};

document.addEventListener('DOMContentLoaded', initialize);
document.querySelector('form').addEventListener('submit', handleSubmit);
