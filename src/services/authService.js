import Vue from 'vue';
import VueAxios from 'vue-axios';
import axios from 'axios';
Vue.use(VueAxios, axios);

export default class AuthService {


  /**
   * ajoute au session storage les infos relatifs au user connécté.
   */
  // eslint-disable-next-line class-methods-use-this,require-await
  static loginKC(keycloak) {
    try {
      // eslint-disable-next-line no-console
      console.log('on est d ns le loginKC', keycloak.idToken);
      if (keycloak.idToken !== null) {
        const emailKC = keycloak.tokenParsed.email;
        const rolesKC = keycloak.realmAccess.roles;
        const tokenKC = keycloak.token;
        Promise.all([emailKC, rolesKC, tokenKC]).then(values => {
          const usernameKC = values[0].split('@')[0].toUpperCase();
          sessionStorage.setItem('token', JSON.stringify(values[2]));
          sessionStorage.setItem('roles', JSON.stringify(values[1]));
          console.log(this.getUserInfo(usernameKC, values[0], values[2], values[1]))

          return this.getUserInfo(usernameKC, values[0], values[2], values[1]).then(userWithInfo => {
            if (userWithInfo !== undefined) {
              sessionStorage.setItem('user', JSON.stringify(userWithInfo[0]));

              return userWithInfo[0];
            }

            return 'user info null';
          }
          );
        });
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /**
   * requete pour récuperer les infos à ajouter au token keycloak.
   * @param {string} username username du user connécté.
   * @param {string} email email du user connécté.
   * @param {string} token token de session du user connécté.
   * @param {*} token token de session du user connécté.
   * @return {*}
   */
  // eslint-disable-next-line class-methods-use-this
  static async getUserInfo(username, email, token, roles) {
    const API_URL= 'http://localhost:8080/pactng-backend/api/v1/';

    // eslint-disable-next-line no-return-assign
    const result = await axios.get(`${API_URL}users/${username}/relationEntiteOrgaUser`, {Authorization: `Bearer ${sessionStorage.getItem('token')}`}).then(response => response.data.data.map(infoUser => ({
      centre: JSON.stringify(infoUser.centreId),
      id: JSON.stringify(infoUser.userId),
      username,
      accessToken: token,
      email,
      roles
    })));

    console.log(result);

    return result;
  }


  // eslint-disable-next-line class-methods-use-this
  static logout() {
    Vue.prototype.$keycloak.logoutFn();
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('roles');
    sessionStorage.removeItem('reloaded');
  }



  /**
   * Return the connected user.
   * @return {String} username The user username
   */
  // eslint-disable-next-line class-methods-use-this
  static getUser() {
    // eslint-disable-next-line no-console
    console.log('on est dans getUSER');

    return JSON.parse(sessionStorage.getItem('user'));


  }
}
