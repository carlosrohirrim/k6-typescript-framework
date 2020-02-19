import { group } from 'k6';
import { Options } from 'k6/options';

import { randomString } from '../lib/test-data.helpers'
import { createRequestConfigWithTag } from '../lib/request.helpers';
import { setSleep } from '../lib/sleep.helpers'

import { User } from '../lib/types/users'

import * as crocodileOwnerActions from '../actions/roles/crocodile-owner.role'
import * as adminActions from '../actions/roles/admin.role'
import * as publicUserActions from '../actions/roles/publicUser.role'


// Test Options https://docs.k6.io/docs/options
export let options: Partial<Options> = {
 // a single stage where we ramp up to 70 users over 30 seconds 
 stages: [
   { target: 10, duration: '30s' },
 ],
 // test thresholds https://docs.k6.io/docs/thresholds
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1500'],
    'http_req_duration{name:PublicCrocs}': ['avg<400'],
    'http_req_duration{name:Create}': ['avg<600', 'max<2000'],
  },
};

const CROCODILE_OWNER: User = {
  first_name: "Crocodile",
  last_name: "Owner",
  username: `${randomString(10)}@example.com`,  // Set your own email or `${randomString(10)}@example.com`;,
  password: 'superCroc2019'
}

const BASE_URL = 'https://test-api.loadimpact.com';

// The Setup Function is run once before the Load Test https://docs.k6.io/docs/test-life-cycle
export function setup() {

  // admin user can create a new user without logging in - this is just a test system
  adminActions.registerNewUser(CROCODILE_OWNER, BASE_URL);

  // new user 'Crocodile Owner' logs in and returns the auth token
  const authToken = crocodileOwnerActions.login(CROCODILE_OWNER, BASE_URL);

  // anything returned here can be imported into the default function https://docs.k6.io/docs/test-life-cycle
  return authToken;
}

// default function (imports the Bearer token) https://docs.k6.io/docs/test-life-cycle
export default (_authToken) => {

  // Public actions - you don't need to be logged in to perform these
  // this is a group https://docs.k6.io/docs/tags-and-groups
  group('Query and Check Crocs', () => {

    const responses = publicUserActions.queryCrocodiles(BASE_URL);
    publicUserActions.checkAges(responses, 5)

  })

  // Private actions - you need to be logged in to do these
  group('Create and modify crocs', () => {

    const requestConfigWithTag = createRequestConfigWithTag(_authToken); // Sets the auth token in the header of requests and the 'public requests' tag
    let URL = `${BASE_URL}/my/crocodiles/`;

    // returns an updated URL that contains the crocodile ID
    URL = crocodileOwnerActions.createCrocodile(requestConfigWithTag, URL);

    crocodileOwnerActions.updateCrocodile(requestConfigWithTag, URL, "New Name");
    
    crocodileOwnerActions.deleteCrocodile(requestConfigWithTag, URL);

  });

  // sleeps help keep your script realistic https://docs.k6.io/docs/sleep-t-1
  setSleep();
} 