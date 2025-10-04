import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async ({locale}) => {
  // This can be simplified to just import the file directly
  // since we only have one locale at the moment.
  const messages = (await import(`../messages/${locale}.json`)).default;
 
  return {
    messages
  };
});