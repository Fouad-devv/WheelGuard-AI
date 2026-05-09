<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>

  <#if section = "header"></#if>

  <#if section = "form">
  <div id="kc-container-wrapper">

    <!-- LEFT PANEL -->
    <div class="kc-left">
      <div class="kc-brand">
        <div class="kc-brand-icon">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <div class="kc-brand-text">
          <div class="kc-brand-name">LumiQuality AI</div>
          <div class="kc-brand-ver">v1.0</div>
        </div>
      </div>

      <div class="kc-sso-badge">
        <span class="dot"></span>
        ACCÈS SÉCURISÉ – SSO KEYCLOAK
      </div>

      <h1 class="kc-welcome">Prédiction qualité<br><span>par intelligence artificielle</span></h1>
      <p class="kc-tagline">Saisissez les 13 paramètres machine d'injection et obtenez la classe de qualité de votre lentille plastique en temps réel, avant le contrôle photométrique final.</p>

      <div class="kc-features">
        <div class="kc-feature">
          <div class="kc-feature-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <div>
            <div class="kc-feature-title">Prédiction en temps réel</div>
            <div class="kc-feature-desc">Résultat en moins de 2 s — Rebut, Acceptable, Cible ou Inefficient</div>
          </div>
        </div>
        <div class="kc-feature">
          <div class="kc-feature-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
            </svg>
          </div>
          <div>
            <div class="kc-feature-title">Dashboard analytique</div>
            <div class="kc-feature-desc">KPI, taux de rebut, tendances et importance des paramètres</div>
          </div>
        </div>
        <div class="kc-feature">
          <div class="kc-feature-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
          </div>
          <div>
            <div class="kc-feature-title">Gestion des accès</div>
            <div class="kc-feature-desc">Rôles Opérateur, Manager et Administrateur</div>
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT PANEL -->
    <div class="kc-right">
      <div class="kc-form-box">

        <div class="kc-mobile-brand">
          <div class="kc-brand-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z"/>
            </svg>
          </div>
          <div class="kc-brand-text">
            <div class="kc-brand-name">LumiQuality AI</div>
            <div class="kc-brand-ver">v1.0</div>
          </div>
        </div>

        <div class="kc-auth-badge">
          <span class="dot"></span>
          AUTHENTIFICATION SÉCURISÉE
        </div>

        <h2 class="kc-form-title">Connectez-vous</h2>
        <p class="kc-form-subtitle">Entrez vos identifiants pour accéder à LumiQuality AI</p>

        <#if message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
          <div class="alert alert-${message.type}">${kcSanitize(message.summary)?no_esc}</div>
        </#if>

        <form action="${url.loginAction}" method="post">
          <input type="hidden" name="credentialId" value="${(auth.selectedCredential)!''}"/>

          <!-- Username -->
          <div class="form-group">
            <label class="form-label" for="username">
              <#if realm.registrationEmailAsUsername>EMAIL<#else>NOM D'UTILISATEUR</#if>
            </label>
            <div class="input-wrap">
              <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
              </svg>
              <input
                id="username" name="username"
                type="<#if realm.registrationEmailAsUsername>email<#else>text</#if>"
                class="form-control <#if messagesPerField.existsError('username','password')>error</#if>"
                value="${(login.username!'')}"
                autofocus autocomplete="<#if realm.registrationEmailAsUsername>email<#else>username</#if>"
                placeholder="<#if realm.registrationEmailAsUsername>votre@email.com<#else>Nom d'utilisateur</#if>"
              />
            </div>
            <#if messagesPerField.existsError('username')>
              <div class="field-error">${kcSanitize(messagesPerField.get('username'))?no_esc}</div>
            </#if>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label class="form-label" for="password">MOT DE PASSE</label>
            <div class="input-wrap">
              <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <input
                id="password" name="password" type="password"
                class="form-control has-toggle <#if messagesPerField.existsError('username','password')>error</#if>"
                autocomplete="current-password" placeholder="••••••••"
              />
              <button type="button" class="pw-toggle" aria-label="Afficher le mot de passe">
                <svg class="eye-show" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg class="eye-hide" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display:none">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
              </button>
            </div>
            <#if messagesPerField.existsError('password')>
              <div class="field-error">${kcSanitize(messagesPerField.get('password'))?no_esc}</div>
            </#if>
          </div>

          <!-- Remember me + Forgot -->
          <div class="kc-options">
            <#if realm.rememberMe && !usernameEditDisabled??>
              <label class="kc-remember">
                <input type="checkbox" name="rememberMe" <#if login.rememberMe??>checked</#if>>
                Se souvenir de moi
              </label>
            <#else><span></span></#if>
            <#if realm.resetPasswordAllowed>
              <a class="kc-forgot" href="${url.loginResetCredentialsUrl}">Mot de passe oublié ?</a>
            </#if>
          </div>

          <#if csrf??><input type="hidden" name="${csrf.paramName}" value="${csrf.token}"/></#if>

          <button class="btn-primary" type="submit">
            Se connecter
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
            </svg>
          </button>
        </form>

        <#if realm.password && realm.registrationAllowed && !registrationDisabled??>
          <div class="kc-footer">
            Pas encore de compte ?<a href="${url.registrationUrl}">Créer un compte</a>
          </div>
        </#if>

      </div>
    </div>

  </div>
  <script src="${url.resourcesPath}/js/login.js"></script>
  </#if>

</@layout.registrationLayout>
