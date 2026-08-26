import { corsHeaders } from '../_shared/gemini.ts'

const EFFECTIVE_DATE = 'August 26, 2026'
const CONTACT_EMAIL = 'alamdarmanafov@gmail.com'

const PAGE_STYLE = `
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 720px; margin: 0 auto; padding: 32px 20px 80px; color: #12233D; line-height: 1.6; }
  h1 { font-size: 26px; margin-bottom: 4px; }
  h2 { font-size: 18px; margin-top: 32px; }
  .meta { color: #6B7A90; font-size: 13px; margin-bottom: 32px; }
  .lang { margin-top: 56px; padding-top: 32px; border-top: 1px solid #DCEEFB; }
  a { color: #2F8FE0; }
  ul { padding-left: 20px; }
`

function page(title: string, body: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${title} — Be Positive</title><style>${PAGE_STYLE}</style></head><body>${body}</body></html>`
}

function privacyPage(): string {
  const en = `
    <h1>Privacy Policy</h1>
    <p class="meta">Effective ${EFFECTIVE_DATE}</p>
    <p>Be Positive ("the app") is a mood and gratitude journal. This page explains what data we collect and why.</p>

    <h2>What we collect</h2>
    <ul>
      <li><strong>Account info</strong>: your email address and name, from Sign in with Apple, Sign in with Google, or an email/password you set — used only to identify your account.</li>
      <li><strong>Push notification token</strong>: if you enable reminders, we store a device push token (and your preferred language) so we can send you daily reminders and a weekly recap.</li>
      <li><strong>AI chat usage count</strong>: we store how many AI chat messages you've sent today, to enforce the daily free-message limit. We do not store the content of your chat messages.</li>
    </ul>

    <h2>What we do <em>not</em> collect</h2>
    <p>Your journal entries — mood, notes, gratitude, and factors — are stored only on your device and are never uploaded to our servers. If you delete the app or lose your device, this local journal data cannot be recovered by us, because we never had it.</p>

    <h2>Third parties</h2>
    <ul>
      <li><strong>Apple / Google</strong>: used for sign-in, per their own privacy policies.</li>
      <li><strong>Supabase</strong>: our backend provider, hosts your account and the data listed above.</li>
      <li><strong>Google Gemini API</strong>: when you use the AI Coach or AI Chat, the text you write (your check-in note/gratitude, or your chat message) is sent to Google's Gemini API to generate a reply. It is not stored by us afterward.</li>
      <li><strong>Expo</strong>: delivers push notifications to your device using your push token.</li>
    </ul>
    <p>We do not use analytics or advertising SDKs, and we do not sell your data.</p>

    <h2>Your rights</h2>
    <p>You can delete your account at any time from Profile → "Delete account", which permanently deletes your account and the server-side data listed above. You can also turn off reminders at any time, which removes your push token.</p>

    <h2>Children</h2>
    <p>Be Positive is not directed at children under 13, and we do not knowingly collect data from them.</p>

    <h2>Changes</h2>
    <p>We may update this policy from time to time; the effective date above will reflect the latest change.</p>

    <h2>Contact</h2>
    <p>Questions? Email <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>
  `

  const az = `
    <h1>Məxfilik Siyasəti</h1>
    <p class="meta">Qüvvəyə minmə tarixi: ${EFFECTIVE_DATE}</p>
    <p>Be Positive ("tətbiq") əhval-ruhiyyə və minnətdarlıq gündəliyidir. Bu səhifə hansı məlumatları topladığımızı və səbəbini izah edir.</p>

    <h2>Nə toplayırıq</h2>
    <ul>
      <li><strong>Hesab məlumatı</strong>: email ünvanın və adın — Apple ilə giriş, Google ilə giriş, və ya təyin etdiyin email/şifrə vasitəsilə — yalnız hesabını tanımaq üçün istifadə olunur.</li>
      <li><strong>Push bildiriş tokeni</strong>: xatırlatmaları aktivləşdirsən, gündəlik xatırlatma və həftəlik icmal göndərmək üçün cihaz tokenini (və seçdiyin dili) saxlayırıq.</li>
      <li><strong>AI söhbət sayı</strong>: gündəlik pulsuz mesaj limitini tətbiq etmək üçün bu gün neçə AI mesajı göndərdiyini saxlayırıq. Söhbət mesajlarının məzmununu saxlamırıq.</li>
    </ul>

    <h2>Nəyi toplamırıq</h2>
    <p>Gündəlik qeydlərin — əhval, qeyd, minnətdarlıq və amillər — yalnız cihazında saxlanılır və heç vaxt serverlərimizə yüklənmir. Tətbiqi silsən və ya cihazını itirsən, bu yerli məlumatları biz bərpa edə bilmərik, çünki heç vaxt bizdə olmayıb.</p>

    <h2>Üçüncü tərəflər</h2>
    <ul>
      <li><strong>Apple / Google</strong>: giriş üçün istifadə olunur, öz məxfilik siyasətlərinə uyğun.</li>
      <li><strong>Supabase</strong>: backend provayderimiz, hesabını və yuxarıdakı məlumatları saxlayır.</li>
      <li><strong>Google Gemini API</strong>: AI Koç və ya AI Söhbətdən istifadə etdikdə, yazdığın mətn (qeyd/minnətdarlıq və ya söhbət mesajı) cavab yaratmaq üçün Google-un Gemini API-sinə göndərilir. Sonra bizdə saxlanılmır.</li>
      <li><strong>Expo</strong>: push tokenindən istifadə edərək cihazına bildirişlər çatdırır.</li>
    </ul>
    <p>Analitika və ya reklam SDK-ları istifadə etmirik, məlumatlarını satmırıq.</p>

    <h2>Hüquqların</h2>
    <p>İstənilən vaxt Profil → "Hesabı sil" bölməsindən hesabını silə bilərsən — bu, hesabını və yuxarıda qeyd olunan server tərəfindəki məlumatları həmişəlik silir. İstənilən vaxt xatırlatmaları söndürə bilərsən, bu da push tokenini silir.</p>

    <h2>Uşaqlar</h2>
    <p>Be Positive 13 yaşdan kiçik uşaqlar üçün nəzərdə tutulmayıb və onlardan bilərəkdən məlumat toplamırıq.</p>

    <h2>Dəyişikliklər</h2>
    <p>Bu siyasəti vaxtaşırı yeniləyə bilərik; yuxarıdakı tarix son dəyişikliyi göstərəcək.</p>

    <h2>Əlaqə</h2>
    <p>Sualın var? <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> ünvanına yaz.</p>
  `

  return page('Privacy Policy', `${en}<div class="lang">${az}</div>`)
}

function termsPage(): string {
  const en = `
    <h1>Terms of Use</h1>
    <p class="meta">Effective ${EFFECTIVE_DATE}</p>
    <p>By using Be Positive, you agree to these terms.</p>

    <h2>The service</h2>
    <p>Be Positive is a personal mood and gratitude journal with an optional AI coach and AI chat feature. It is not a medical, psychiatric, or crisis service. AI-generated messages are for general encouragement only and are not professional advice. If you are in crisis, please contact your local emergency services or a mental health professional.</p>

    <h2>Your account</h2>
    <p>You sign in with Apple, Google, or an email/password you set yourself. You're responsible for keeping your sign-in credentials secure.</p>

    <h2>Your content</h2>
    <p>Your journal entries stay on your device, as described in our Privacy Policy. You're responsible for what you write, including in the AI chat, which is sent to a third-party AI provider to generate a reply.</p>

    <h2>Acceptable use</h2>
    <p>Don't use the app to harm others, attempt to abuse or overload our services, or reverse-engineer the app.</p>

    <h2>Termination</h2>
    <p>You can delete your account at any time from Profile → "Delete account". We may suspend accounts that abuse the service.</p>

    <h2>Disclaimer</h2>
    <p>The app is provided "as is," without warranties of any kind. We are not liable for any damages arising from your use of the app, to the extent permitted by law.</p>

    <h2>Changes</h2>
    <p>We may update these terms from time to time; continued use of the app means you accept the current version.</p>

    <h2>Contact</h2>
    <p>Questions? Email <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>
  `

  const az = `
    <h1>İstifadə Şərtləri</h1>
    <p class="meta">Qüvvəyə minmə tarixi: ${EFFECTIVE_DATE}</p>
    <p>Be Positive tətbiqindən istifadə edərək bu şərtlərlə razılaşırsan.</p>

    <h2>Xidmət</h2>
    <p>Be Positive şəxsi əhval-ruhiyyə və minnətdarlıq gündəliyidir, istəyə bağlı AI koç və AI söhbət funksiyası ilə. Bu, tibbi, psixiatrik və ya kризis xidməti deyil. AI tərəfindən yaradılan mesajlar yalnız ümumi dəstək məqsədlidir, peşəkar məsləhət deyil. Kризis vəziyyətindəsənsə, xahiş edirik yerli təcili xidmətlərlə və ya mütəxəssislə əlaqə saxla.</p>

    <h2>Hesabın</h2>
    <p>Apple, Google və ya özün təyin etdiyin email/şifrə ilə daxil olursan. Giriş məlumatlarını qorumaq sənin məsuliyyətindədir.</p>

    <h2>Sənin məzmunun</h2>
    <p>Gündəlik qeydlərin Məxfilik Siyasətində qeyd olunduğu kimi cihazında qalır. Yazdıqların üçün, o cümlədən cavab yaratmaq üçün üçüncü tərəf AI provayderinə göndərilən AI söhbət mesajların üçün məsuliyyət daşıyırsan.</p>

    <h2>Məqbul istifadə</h2>
    <p>Tətbiqi başqalarına zərər vermək, xidmətlərimizi sui-istifadə etmək və ya tətbiqi tərs mühəndisliklə araşdırmaq üçün istifadə etmə.</p>

    <h2>Ləğv etmə</h2>
    <p>İstənilən vaxt Profil → "Hesabı sil" bölməsindən hesabını silə bilərsən. Xidməti sui-istifadə edən hesabları dayandıra bilərik.</p>

    <h2>Məsuliyyətdən imtina</h2>
    <p>Tətbiq "olduğu kimi", heç bir zəmanət olmadan təqdim olunur. Qanunun icazə verdiyi həddə, tətbiqdən istifadənlə bağlı yaranan zərərlərə görə məsuliyyət daşımırıq.</p>

    <h2>Dəyişikliklər</h2>
    <p>Bu şərtləri vaxtaşırı yeniləyə bilərik; tətbiqdən istifadəni davam etdirmək cari versiyanı qəbul etdiyin deməkdir.</p>

    <h2>Əlaqə</h2>
    <p>Sualın var? <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> ünvanına yaz.</p>
  `

  return page('Terms of Use', `${en}<div class="lang">${az}</div>`)
}

Deno.serve((req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  const url = new URL(req.url)
  const isTerms = url.pathname.endsWith('/terms')
  const html = isTerms ? termsPage() : privacyPage()

  return new Response(html, {
    headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
  })
})
