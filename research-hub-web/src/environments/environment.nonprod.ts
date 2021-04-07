// TODO: Insert nonprod values
export const environment = {
  production: true,
  cerGraphQLUrl: '',
  analyticsCode: '',
  auth: {
    cognitoAwsRegion: 'ap-southeast-2',
    cognitoUserPoolId: '',
    cognitoDomain: '',
    cognitoClientId: '',
    redirectUri: '',
    scopes: '',
    codeChallengeMethod: 'S256',
    logout_uri: ''
  },
  searchUrl: 'https://apigw.test.amazon.auckland.ac.nz/hub-search-proxy',
  privateUrlKeyWords: {
    get whoNeedBearerToken() {
      return [
        { url: 'apigw.sandbox.amazon.auckland.ac.nz', optional: false },
        { url: environment.cerGraphQLUrl, optional: true }
      ]
    },
    get whoNeedIdToken() {
      return []
    }
  },
};
