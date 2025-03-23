import { WebStorageStateStore } from "oidc-client-ts"
import { createOidcAuth, SignInType, type OidcAuth } from 'vue-oidc-client/vue3'

export var mainOidc: OidcAuth | null = null

if (Number(import.meta.env.VITE_ENABLE_OIDC) === 1) {
    mainOidc = createOidcAuth(
        "main",
        SignInType.Window,
        import.meta.env.VITE_APP_URI,
        {
            authority: import.meta.env.VITE_AUTHORITY,
            client_id: import.meta.env.VITE_CLIENT_ID,
            post_logout_redirect_uri: import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI,
            userStore: new WebStorageStateStore({ store: window.sessionStorage }),
            response_type: 'code',
            monitorSession: true, // this allows cross tab login/logout detection

            // the default redirection seems to do the job already!
            // redirect_uri: import.meta.env.VITE_REDIRECT_URI,
        },
    )
}
