/**
 * HumanChain — World Developer Portal Localisation Setter
 *
 * Sets localised content for all 12 non-English languages in the portal.
 * The portal's main API endpoint accepts a top-level `localisations` array
 * that the MCP tool does not expose.
 *
 * Usage:
 *   DEV_PORTAL_API_KEY=your_key node scripts/set-portal-localisations.js
 *
 * Find your API key:
 *   developer.worldcoin.org → Settings → API Keys → Copy key
 */

"use strict";

const APP_ID = "app_fd34958eed3f67a6710d76c46d261f77";
const API_KEY = process.env.DEV_PORTAL_API_KEY;

if (!API_KEY) {
  console.error("\n❌ Missing DEV_PORTAL_API_KEY environment variable.");
  console.error("   Get it from: developer.worldcoin.org → Settings → API Keys");
  console.error("   Run as: DEV_PORTAL_API_KEY=your_key node scripts/set-portal-localisations.js\n");
  process.exit(1);
}

// ── All 12 non-English localizations ────────────────────────────────────────
const localisations = [
  {
    locale: "es",
    name: "HumanChain",
    short_name: "HumanChain",
    world_app_button_text: "Abrir HumanChain",
    world_app_description:
      "La única red social donde cada persona es un humano real verificado. Pregunta, publica, comercia y construye tu pasaporte de confianza — dentro de World App.",
    description_overview:
      "HumanChain es una red social de humanos verificados construida exclusivamente dentro de World App. Cada usuario es confirmado como una persona única y real a través de World ID — lo que la convierte en la primera plataforma donde los bots, las cuentas falsas y las identidades duplicadas son estructuralmente imposibles.\n\nHaz preguntas reales y recibe respuestas de humanos verificados de todo el mundo. Comparte momentos visuales vinculados a tu identidad verificada. Compra y vende artículos cercanos a través de un mercado de confianza impulsado por pagos WLD. Lee historias humanas curadas mensualmente. Construye tu Pasaporte Humano — una puntuación de confianza en vivo, racha, historial de insignias, puntos HP y récord de reputación que crece con cada acción honesta.\n\nHumanChain está disponible en 13 idiomas y sirve a humanos verificados en más de 180 países.",
    description_how_it_works:
      "Inicia sesión una vez con tu cartera World ID. Tu verificación desbloquea al instante las cinco funciones principales:\n\nPREGUNTAR — Publica preguntas a la comunidad global de humanos verificados. Responde la pregunta diaria para ganar +18 HP. Cada respuesta está vinculada a una identidad humana única y real.\n\nMOMENTOS — Comparte publicaciones visuales con tu nombre de usuario verificado. Sin publicaciones anónimas.\n\nMERCADO — Lista artículos con tres fotos, notas de condición y precio fijo en WLD. Los compradores navegan gratis. Los vendedores pagan una pequeña tarifa WLD para publicar o impulsar.\n\nHISTORIAS — Lee historias curadas mensuales escritas por humanos verificados sobre identidad, migración, fe, dinero, amor y propósito.\n\nPASAPORTE — Sigue tu Puntuación Humana, racha, libro de HP, historial de operaciones e insignias en una identidad de confianza en vivo. Comparte tu enlace de referido para invitar a otros humanos y ganar +50 HP por unión verificada.",
    description_connect:
      "HumanChain usa World ID Sign-In con Ethereum (SIWE) para verificar que cada usuario es un humano único y real antes de que se permita cualquier acción pública. Sin bots. Sin cuentas duplicadas.\n\nTu dirección de cartera nunca se muestra públicamente — solo tu nombre de usuario World aparece en preguntas, historias, anuncios y enlaces de cadena. Puedes revocar el acceso de HumanChain desde la configuración de World App en cualquier momento.\n\nLos pagos WLD se procesan a través del sistema de pago nativo de World App. Las notificaciones son solo funcionales: recordatorios de preguntas diarias, alertas de pujas, confirmaciones de pago y alertas de seguridad de cuenta.",
  },
  {
    locale: "fr",
    name: "HumanChain",
    short_name: "HumanChain",
    world_app_button_text: "Ouvrir HumanChain",
    world_app_description:
      "Le seul réseau social où chaque personne est un vrai humain vérifié. Posez, publiez, échangez et construisez votre passeport de confiance — dans World App.",
    description_overview:
      "HumanChain est un réseau social d'humains vérifiés construit exclusivement dans World App. Chaque utilisateur est confirmé comme une personne unique et réelle via World ID — ce qui en fait la première plateforme où les bots, les faux comptes et les identités dupliquées sont structurellement impossibles.\n\nPosez de vraies questions et recevez des réponses d'humains vérifiés du monde entier. Partagez des moments visuels liés à votre identité vérifiée. Achetez et vendez des articles proches via un marché de confiance alimenté par les paiements WLD. Lisez des histoires humaines curatées mensuellement. Construisez votre Passeport Humain — un score de confiance en direct, une série, un historique de badges, des points HP et un bilan de réputation qui grandit à chaque action honnête.\n\nHumanChain est disponible en 13 langues et sert des humains vérifiés dans plus de 180 pays.",
    description_how_it_works:
      "Connectez-vous une fois avec votre portefeuille World ID. Votre vérification débloque instantanément les cinq fonctionnalités principales :\n\nDEMANDER — Publiez des questions à la communauté mondiale d'humains vérifiés. Répondez à la question quotidienne pour gagner +18 HP. Chaque réponse est liée à une identité humaine unique et réelle.\n\nMOMENTS — Partagez des publications visuelles avec votre nom d'utilisateur vérifié. Aucune publication anonyme.\n\nMARCHÉ — Listez des articles avec trois photos, des notes de condition et un prix WLD fixe. Les acheteurs naviguent gratuitement. Les vendeurs paient une petite taxe WLD pour publier ou booster.\n\nHISTOIRES — Lisez des histoires curatées mensuelles écrites par de vrais humains vérifiés sur l'identité, la migration, la foi, l'argent, l'amour et le but.\n\nPASSEPORT — Suivez votre Score Humain, série, livre HP, historique des transactions et badges dans une identité de confiance en direct. Partagez votre lien de parrainage pour inviter d'autres humains et gagner +50 HP par adhésion vérifiée.",
    description_connect:
      "HumanChain utilise World ID Sign-In with Ethereum (SIWE) pour vérifier que chaque utilisateur est un humain unique et réel avant que toute action publique soit autorisée. Aucun bot. Aucun compte dupliqué.\n\nVotre adresse de portefeuille n'est jamais affichée publiquement — seul votre nom d'utilisateur World apparaît dans les questions, histoires, annonces et liens de chaîne. Vous pouvez révoquer l'accès de HumanChain depuis les paramètres de World App à tout moment.\n\nLes paiements WLD sont traités via le système de paiement natif de World App. Les notifications sont uniquement fonctionnelles : rappels quotidiens, alertes d'offres, confirmations de paiement et alertes de sécurité du compte.",
  },
  {
    locale: "pt",
    name: "HumanChain",
    short_name: "HumanChain",
    world_app_button_text: "Abrir HumanChain",
    world_app_description:
      "A única rede social onde cada pessoa é um humano real verificado. Pergunte, publique, negocie e construa seu passaporte de confiança — dentro do World App.",
    description_overview:
      "HumanChain é uma rede social de humanos verificados construída exclusivamente dentro do World App. Cada usuário é confirmado como uma pessoa única e real pelo World ID — tornando-a a primeira plataforma onde bots, contas falsas e identidades duplicadas são estruturalmente impossíveis.\n\nFaça perguntas reais e receba respostas de humanos verificados de todo o mundo. Compartilhe momentos visuais vinculados à sua identidade verificada. Compre e venda itens próximos por meio de um mercado de confiança alimentado por pagamentos WLD. Leia histórias humanas selecionadas mensalmente. Construa seu Passaporte Humano — uma pontuação de confiança ao vivo, sequência, histórico de medalhas, pontos HP e registro de reputação que cresce a cada ação honesta.\n\nHumanChain está disponível em 13 idiomas e atende humanos verificados em mais de 180 países.",
    description_how_it_works:
      "Entre uma vez com sua carteira World ID. Sua verificação desbloqueia instantaneamente os cinco recursos principais:\n\nPERGUNTAR — Publique perguntas para a comunidade global de humanos verificados. Responda à pergunta diária para ganhar +18 HP. Cada resposta está vinculada a uma identidade humana única e real.\n\nMOMENTOS — Compartilhe publicações visuais com seu nome de usuário verificado. Sem publicações anônimas.\n\nMERCADO — Liste itens com três fotos, notas de condição e preço fixo em WLD. Compradores navegam gratuitamente. Vendedores pagam uma pequena taxa WLD para publicar ou impulsionar.\n\nHISTÓRIAS — Leia histórias curadas mensais escritas por humanos verificados sobre identidade, migração, fé, dinheiro, amor e propósito.\n\nPASSAPORTE — Acompanhe sua Pontuação Humana, sequência, livro de HP, histórico de negociações e medalhas em uma identidade de confiança ao vivo. Compartilhe seu link de indicação para convidar outros humanos e ganhar +50 HP por adesão verificada.",
    description_connect:
      "HumanChain usa World ID Sign-In com Ethereum (SIWE) para verificar que cada usuário é um humano único e real antes que qualquer ação pública seja permitida. Sem bots. Sem contas duplicadas.\n\nSeu endereço de carteira nunca é exibido publicamente — apenas seu nome de usuário World aparece em perguntas, histórias, anúncios e links de cadeia. Você pode revogar o acesso do HumanChain nas configurações do World App a qualquer momento.\n\nOs pagamentos WLD são processados pelo sistema de pagamento nativo do World App. As notificações são apenas funcionais: lembretes diários, alertas de lances, confirmações de pagamento e alertas de segurança da conta.",
  },
  {
    locale: "sw",
    name: "HumanChain",
    short_name: "HumanChain",
    world_app_button_text: "Fungua HumanChain",
    world_app_description:
      "Mtandao pekee wa kijamii ambapo kila mtu ni binadamu halisi aliyethibitishwa. Uliza, chapisha, fanya biashara na ujenga pasipoti yako ya uaminifu — ndani ya World App.",
    description_overview:
      "HumanChain ni mtandao wa kijamii wa binadamu waliothibitishwa uliojengwa peke yake ndani ya World App. Kila mtumiaji anathibitishwa kama mtu wa kipekee na wa kweli kupitia World ID — kuifanya kuwa jukwaa la kwanza ambapo boti, akaunti za uongo, na utambulisho uliodanganywa hauwezekani kimuundo.\n\nUliza maswali ya kweli na upate majibu kutoka kwa binadamu waliothibitishwa duniani kote. Shiriki matukio ya picha yanayohusiana na utambulisho wako uliothibitishwa. Nunua na uuze vitu vilivyo karibu nawe kupitia soko la uaminifu linalotumia malipo ya WLD. Soma hadithi za binadamu zilizochaguliwa kila mwezi. Jenga Pasipoti yako ya Binadamu — alama ya uaminifu ya moja kwa moja, mfululizo, historia ya beji, pointi za HP, na rekodi ya sifa inayokua kwa kila tendo la uaminifu.\n\nHumanChain inapatikana katika lugha 13 na inasaidia binadamu waliothibitishwa katika nchi zaidi ya 180.",
    description_how_it_works:
      "Ingia mara moja kwa pochi yako ya World ID. Uthibitisho wako unafungua mara moja vipengele vitano vikuu:\n\nULIZA — Chapisha maswali kwa jamii ya kimataifa ya binadamu waliothibitishwa. Jibu swali la kila siku ili kupata +18 HP. Kila jibu linahusishwa na utambulisho wa kipekee wa binadamu wa kweli.\n\nMAWAKATI — Shiriki machapisho ya picha kwa jina lako la mtumiaji lililothibitishwa. Hakuna machapisho ya kujificha.\n\nSOKO — Orodhesha bidhaa na picha tatu, maelezo ya hali, na bei ya WLD iliyowekwa. Wanunuzi wanaweza kuvinjari bure. Wauzaji hulipa ada ndogo ya WLD kuchapisha au kuimarisha.\n\nHADITHI — Soma hadithi za kila mwezi zilizoandikwa na binadamu halisi waliothibitishwa kuhusu utambulisho, uhamiaji, imani, fedha, upendo, na kusudi.\n\nPASIPOTI — Fuatilia Alama yako ya Binadamu, mfululizo, kitabu cha HP, historia ya biashara, na beji katika utambulisho wa uaminifu wa moja kwa moja. Shiriki kiungo chako cha rufaa ili kuwakaribisha binadamu wengine na kupata +50 HP kwa kila kujiandikisha kuliothibitishwa.",
    description_connect:
      "HumanChain hutumia World ID Sign-In na Ethereum (SIWE) kuthibitisha kwamba kila mtumiaji ni binadamu wa kipekee na wa kweli kabla ya kitendo chochote cha umma kuruhusiwa. Hakuna boti. Hakuna akaunti za uongo.\n\nAnwani yako ya pochi haionyeshwi hadharani kamwe — jina lako la mtumiaji wa World peke yake linaonekana katika maswali, hadithi, matangazo, na viungo vya mnyororo. Unaweza kufuta ufikiaji wa HumanChain kutoka mipangilio ya World App wakati wowote.\n\nMalipo ya WLD yanashughulikiwa kupitia mfumo wa malipo asili wa World App. Arifa ni za kazi peke yake: vikumbusho vya kila siku, arifa za zabuni, uthibitisho wa malipo, na arifa za usalama wa akaunti.",
  },
  {
    locale: "ar",
    name: "HumanChain",
    short_name: "HumanChain",
    world_app_button_text: "فتح HumanChain",
    world_app_description:
      "الشبكة الاجتماعية الوحيدة حيث كل شخص بشر حقيقي موثق. اسأل، انشر، تداول، وابنِ جواز سفرك الموثوق — داخل World App.",
    description_overview:
      "HumanChain هي شبكة اجتماعية للبشر الموثقين مبنية حصريًا داخل World App. كل مستخدم مؤكد كشخص فريد وحقيقي عبر World ID — مما يجعلها أول منصة تستحيل فيها البوتات والحسابات المزيفة والهويات المكررة هيكليًا.\n\nاطرح أسئلة حقيقية واحصل على إجابات من بشر موثقين حول العالم. شارك لحظاتك المرئية المرتبطة بهويتك الموثقة. اشترِ وبِع العناصر القريبة من خلال سوق موثوق مدعوم بمدفوعات WLD. اقرأ قصصاً بشرية منتقاة شهريًا. ابنِ جواز سفرك البشري — درجة ثقة مباشرة، سلسلة، سجل شارات، نقاط HP، وسجل سمعة ينمو مع كل فعل صادق.\n\nHumanChain متوفرة بـ13 لغة وتخدم بشراً موثقين في أكثر من 180 دولة.",
    description_how_it_works:
      "سجّل الدخول مرة واحدة بمحفظة World ID الخاصة بك. يفتح توثيقك على الفور جميع الميزات الخمس الأساسية:\n\nاسأل — انشر أسئلة للمجتمع العالمي من البشر الموثقين. أجِب على السؤال اليومي لكسب +18 HP. كل إجابة مرتبطة بهوية بشرية فريدة وحقيقية.\n\nالمواقف — شارك منشورات مرئية باسم مستخدمك الموثق. لا منشورات مجهولة.\n\nالسوق — أدرج العناصر بثلاث صور وملاحظات الحالة وسعر WLD ثابت. المشترون يتصفحون مجانًا. البائعون يدفعون رسومًا رمزية بـWLD للنشر أو التعزيز.\n\nالقصص — اقرأ قصصاً شهرية منتقاة كتبها بشر حقيقيون موثقون عن الهوية والهجرة والإيمان والمال والحب والهدف.\n\nجواز السفر — تتبع درجتك البشرية، سلسلتك، سجل HP، تاريخ المعاملات، والشارات في هوية ثقة مباشرة. شارك رابط إحالتك لدعوة بشر آخرين وكسب +50 HP لكل انضمام موثق.",
    description_connect:
      "يستخدم HumanChain World ID Sign-In مع Ethereum (SIWE) للتحقق من أن كل مستخدم بشر فريد وحقيقي قبل السماح بأي إجراء عام. لا بوتات. لا حسابات مكررة.\n\nعنوان محفظتك لا يُعرض علنًا أبدًا — فقط اسم مستخدم World الخاص بك يظهر في الأسئلة والقصص والإعلانات وروابط السلسلة. يمكنك إلغاء وصول HumanChain من إعدادات World App في أي وقت.\n\nتتم معالجة مدفوعات WLD عبر نظام الدفع الأصلي لـWorld App. الإشعارات وظيفية فقط: تذكيرات يومية، وتنبيهات المزايدة، وتأكيدات الدفع، وتنبيهات أمان الحساب.",
  },
  {
    locale: "hi",
    name: "HumanChain",
    short_name: "HumanChain",
    world_app_button_text: "HumanChain खोलें",
    world_app_description:
      "एकमात्र सोशल नेटवर्क जहाँ हर व्यक्ति एक सत्यापित वास्तविक इंसान है। पूछें, पोस्ट करें, व्यापार करें और अपना विश्वास पासपोर्ट बनाएँ — World App के अंदर।",
    description_overview:
      "HumanChain एक सत्यापित-मानव सोशल नेटवर्क है जो विशेष रूप से World App के अंदर बनाया गया है। प्रत्येक उपयोगकर्ता को World ID के माध्यम से एक अनूठे, वास्तविक व्यक्ति के रूप में पुष्टि की जाती है — जिससे यह पहला मंच बनता है जहाँ बॉट, नकली खाते और डुप्लिकेट पहचान संरचनात्मक रूप से असंभव हैं।\n\nवास्तविक प्रश्न पूछें और दुनिया भर के सत्यापित मनुष्यों से उत्तर प्राप्त करें। अपनी सत्यापित पहचान से जुड़े फोटो-पहले के क्षण साझा करें। WLD भुगतान द्वारा संचालित एक विश्वास-प्रथम बाज़ार के माध्यम से पास की वस्तुएँ खरीदें और बेचें। मासिक रूप से क्यूरेट की गई मानव कहानियाँ पढ़ें। अपना मानव पासपोर्ट बनाएँ — एक लाइव विश्वास स्कोर, स्ट्रीक, बैज इतिहास, HP अंक और प्रतिष्ठा रिकॉर्ड जो हर ईमानदार कार्य के साथ बढ़ता है।\n\nHumanChain 13 भाषाओं में उपलब्ध है और 180+ देशों में सत्यापित मनुष्यों की सेवा करता है।",
    description_how_it_works:
      "अपने World ID वॉलेट से एक बार साइन इन करें। आपका सत्यापन तुरंत सभी पाँच मुख्य सुविधाओं को अनलॉक करता है:\n\nपूछें — वैश्विक सत्यापित-मानव समुदाय को प्रश्न पोस्ट करें। दैनिक प्रश्न का उत्तर दें और +18 HP कमाएँ।\n\nपल — अपने सत्यापित उपयोगकर्ता नाम के साथ फोटो-पहले के पोस्ट साझा करें। कोई गुमनाम पोस्ट नहीं।\n\nबाज़ार — तीन फोटो, स्थिति नोट्स और निश्चित WLD मूल्य के साथ वस्तुएँ सूचीबद्ध करें। खरीदार मुफ्त में ब्राउज़ करते हैं। विक्रेता प्रकाशित करने के लिए एक छोटी WLD शुल्क देते हैं।\n\nकहानियाँ — पहचान, प्रवास, आस्था, धन, प्रेम और उद्देश्य पर लिखी गई मासिक क्यूरेटेड कहानियाँ पढ़ें।\n\nपासपोर्ट — अपने मानव स्कोर, स्ट्रीक, HP लेज़र, व्यापार इतिहास और बैज को लाइव ट्रस्ट पहचान में ट्रैक करें। +50 HP प्रति सत्यापित जुड़ाव के लिए अपना रेफरल लिंक साझा करें।",
    description_connect:
      "HumanChain किसी भी सार्वजनिक कार्य की अनुमति से पहले प्रत्येक उपयोगकर्ता को सत्यापित करने के लिए World ID Sign-In with Ethereum (SIWE) का उपयोग करता है। कोई बॉट नहीं। कोई डुप्लिकेट खाता नहीं।\n\nआपका वॉलेट पता कभी भी सार्वजनिक रूप से प्रदर्शित नहीं होता — केवल आपका World उपयोगकर्ता नाम दिखाई देता है। आप किसी भी समय World App सेटिंग से HumanChain की पहुँच रद्द कर सकते हैं।\n\nWLD भुगतान World App के मूल भुगतान प्रणाली के माध्यम से संसाधित किए जाते हैं। सूचनाएँ केवल कार्यात्मक हैं: दैनिक रिमाइंडर, बोली अलर्ट, भुगतान पुष्टि और खाता सुरक्षा अलर्ट।",
  },
  {
    locale: "id",
    name: "HumanChain",
    short_name: "HumanChain",
    world_app_button_text: "Buka HumanChain",
    world_app_description:
      "Satu-satunya jaringan sosial di mana setiap orang adalah manusia nyata yang terverifikasi. Tanya, posting, berdagang, dan bangun paspor kepercayaan Anda — di dalam World App.",
    description_overview:
      "HumanChain adalah jaringan sosial manusia terverifikasi yang dibangun secara eksklusif di dalam World App. Setiap pengguna dikonfirmasi sebagai orang yang unik dan nyata melalui World ID — menjadikannya platform pertama di mana bot, akun palsu, dan identitas duplikat secara struktural tidak mungkin ada.\n\nAjukan pertanyaan nyata dan terima jawaban dari manusia terverifikasi di seluruh dunia. Bagikan momen berbasis foto yang terkait dengan identitas terverifikasi Anda. Beli dan jual barang di sekitar melalui marketplace kepercayaan yang didukung pembayaran WLD. Baca cerita manusia yang dikurasi setiap bulan. Bangun Paspor Manusia Anda — skor kepercayaan langsung, streak, riwayat lencana, poin HP, dan catatan reputasi yang tumbuh dengan setiap tindakan jujur.\n\nHumanChain tersedia dalam 13 bahasa dan melayani manusia terverifikasi di lebih dari 180 negara.",
    description_how_it_works:
      "Masuk sekali dengan dompet World ID Anda. Verifikasi Anda langsung membuka semua lima fitur utama:\n\nTANYA — Posting pertanyaan ke komunitas manusia terverifikasi global. Jawab pertanyaan harian untuk mendapatkan +18 HP.\n\nMOMEN — Bagikan postingan berbasis foto dengan nama pengguna terverifikasi Anda. Tidak ada postingan anonim.\n\nPASAR — Daftarkan barang dengan tiga foto, catatan kondisi, dan harga WLD tetap. Pembeli menjelajah gratis. Penjual membayar biaya WLD kecil untuk menerbitkan.\n\nCERITA — Baca cerita bulanan yang dikurasi dan ditulis oleh manusia terverifikasi tentang identitas, migrasi, iman, uang, cinta, dan tujuan.\n\nPASPOR — Lacak Skor Manusia, streak, buku HP, riwayat perdagangan, dan lencana Anda dalam satu identitas kepercayaan langsung. Bagikan tautan referral untuk mendapatkan +50 HP per bergabung yang terverifikasi.",
    description_connect:
      "HumanChain menggunakan World ID Sign-In with Ethereum (SIWE) untuk memverifikasi bahwa setiap pengguna adalah manusia unik dan nyata sebelum tindakan publik apa pun diizinkan. Tidak ada bot. Tidak ada akun duplikat.\n\nAlamat dompet Anda tidak pernah ditampilkan secara publik — hanya nama pengguna World Anda yang muncul di pertanyaan, cerita, daftar marketplace, dan tautan rantai. Anda dapat mencabut akses HumanChain dari pengaturan World App kapan saja.\n\nPembayaran WLD diproses melalui sistem pembayaran asli World App. Notifikasi hanya bersifat fungsional: pengingat harian, peringatan tawaran, konfirmasi pembayaran, dan peringatan keamanan akun.",
  },
  {
    locale: "de",
    name: "HumanChain",
    short_name: "HumanChain",
    world_app_button_text: "HumanChain öffnen",
    world_app_description:
      "Das einzige soziale Netzwerk, in dem jeder Nutzer ein verifizierter echter Mensch ist. Fragen, posten, handeln und Vertrauenspass aufbauen — in World App.",
    description_overview:
      "HumanChain ist ein soziales Netzwerk verifizierter Menschen, das ausschließlich in World App aufgebaut wurde. Jeder Nutzer wird über World ID als einzigartige, echte Person bestätigt — was es zur ersten Plattform macht, auf der Bots, gefälschte Konten und doppelte Identitäten strukturell unmöglich sind.\n\nStellen Sie echte Fragen und erhalten Sie Antworten von verifizierten Menschen weltweit. Teilen Sie fotobasierte Momente, die mit Ihrer verifizierten Identität verknüpft sind. Kaufen und verkaufen Sie nahegelegene Artikel über einen vertrauensbasierten Marktplatz, der durch WLD-Zahlungen angetrieben wird. Lesen Sie monatlich kuratierte menschliche Geschichten. Bauen Sie Ihren Menschenpass auf — einen Live-Vertrauenswert, Serie, Abzeichen-Historie, HP-Punkte und Reputationsaufzeichnung, die mit jeder ehrlichen Handlung wächst.\n\nHumanChain ist in 13 Sprachen verfügbar und bedient verifizierte Menschen in mehr als 180 Ländern.",
    description_how_it_works:
      "Melden Sie sich einmal mit Ihrer World ID-Wallet an. Ihre Verifizierung schaltet sofort alle fünf Kernfunktionen frei:\n\nFRAGEN — Stellen Sie Fragen an die globale Gemeinschaft verifizierter Menschen. Beantworten Sie die tägliche Frage, um +18 HP zu verdienen.\n\nMOMENTE — Teilen Sie fotobasierte Beiträge mit Ihrem verifizierten Benutzernamen. Keine anonymen Beiträge.\n\nMARKT — Listen Sie Artikel mit drei Fotos, Zustandsnotizen und einem festen WLD-Preis auf. Käufer können kostenlos stöbern. Verkäufer zahlen eine kleine WLD-Gebühr.\n\nGESCHICHTEN — Lesen Sie monatlich kuratierte Geschichten über Identität, Migration, Glauben, Geld, Liebe und Zweck.\n\nPASS — Verfolgen Sie Ihren Menschenwert, Serie, HP-Buch und Abzeichen in einer Live-Vertrauensidentität. Teilen Sie Ihren Empfehlungslink und verdienen Sie +50 HP pro verifiziertem Beitritt.",
    description_connect:
      "HumanChain verwendet World ID Sign-In with Ethereum (SIWE), um zu verifizieren, dass jeder Nutzer ein einzigartiger, echter Mensch ist. Keine Bots. Keine doppelten Konten.\n\nIhre Wallet-Adresse wird niemals öffentlich angezeigt — nur Ihr World-Benutzername erscheint in Fragen, Geschichten und Listings. Sie können den Zugriff jederzeit in den World App-Einstellungen widerrufen.\n\nWLD-Zahlungen werden über das native Zahlungssystem von World App verarbeitet. Benachrichtigungen sind ausschließlich funktional: tägliche Erinnerungen, Gebotsbenachrichtigungen, Zahlungsbestätigungen und Kontosicherheitsbenachrichtigungen.",
  },
  {
    locale: "tr",
    name: "HumanChain",
    short_name: "HumanChain",
    world_app_button_text: "HumanChain'i Aç",
    world_app_description:
      "Her kullanıcının doğrulanmış gerçek bir insan olduğu tek sosyal ağ. Sor, paylaş, ticaret yap ve güven pasaportunuzu oluşturun — World App içinde.",
    description_overview:
      "HumanChain, yalnızca World App içinde inşa edilmiş doğrulanmış insanlar için bir sosyal ağdır. Her kullanıcı, World ID aracılığıyla benzersiz ve gerçek bir kişi olarak onaylanır — bu da onu botların, sahte hesapların ve çift kimliklerin yapısal olarak imkânsız olduğu ilk platform yapar.\n\nGerçek sorular sorun ve dünya çapındaki doğrulanmış insanlardan yanıtlar alın. Doğrulanmış kimliğinizle bağlantılı fotoğraf odaklı anlar paylaşın. WLD ödemeleriyle desteklenen güven odaklı bir pazar aracılığıyla yakındaki ürünleri alın ve satın. Aylık seçilmiş insan hikayelerini okuyun. İnsan Pasaportunuzu oluşturun — canlı bir güven puanı, seri, rozet geçmişi, HP puanları ve her dürüst eylemle büyüyen bir itibar kaydı.\n\nHumanChain 13 dilde mevcut olup 180'den fazla ülkedeki doğrulanmış insanlara hizmet eder.",
    description_how_it_works:
      "World ID cüzdanınızla bir kez giriş yapın. Doğrulamanız anında beş temel özelliği açar:\n\nSOR — Küresel doğrulanmış insan topluluğuna sorular gönderin. Günlük soruyu yanıtlayarak +18 HP kazanın.\n\nANLAR — Doğrulanmış kullanıcı adınızla fotoğraf odaklı gönderiler paylaşın. Anonim gönderi yoktur.\n\nPAZAR — Üç fotoğraf, durum notları ve sabit WLD fiyatıyla ürünleri listeleyin. Alıcılar ücretsiz gezinir.\n\nHİKAYELER — Kimlik, göç, inanç, para, aşk ve amaç üzerine aylık seçilmiş hikayeleri okuyun.\n\nPASAPORT — İnsan Puanınızı, serinizi ve rozetlerinizi canlı bir güven kimliğinde takip edin. Tavsiye bağlantınızı paylaşın ve her doğrulanmış katılım için +50 HP kazanın.",
    description_connect:
      "HumanChain, her kullanıcının benzersiz ve gerçek bir insan olduğunu doğrulamak için World ID Sign-In with Ethereum (SIWE) kullanır. Bot yok. Çift hesap yok.\n\nCüzdan adresiniz hiçbir zaman herkese açık olarak görüntülenmez — yalnızca World kullanıcı adınız görünür. World App ayarlarından istediğiniz zaman HumanChain erişimini iptal edebilirsiniz.\n\nWLD ödemeleri World App'in yerel ödeme sistemi aracılığıyla işlenir. Bildirimler yalnızca işlevseldir: günlük hatırlatıcılar, teklif uyarıları, ödeme onayları ve hesap güvenliği uyarıları.",
  },
  {
    locale: "ja",
    name: "HumanChain",
    short_name: "HumanChain",
    world_app_button_text: "HumanChainを開く",
    world_app_description:
      "すべてのユーザーが認証済みの本物の人間である唯一のSNS。質問、投稿、取引を行い、信頼パスポートを構築しましょう — World Appの中で。",
    description_overview:
      "HumanChainは、World App内に構築された認証済み人間向けソーシャルネットワークです。すべてのユーザーはWorld IDを通じて唯一の実在の人物として確認されており、ボット、偽アカウント、重複アイデンティティが構造的に不可能な初めてのプラットフォームです。\n\n本物の質問をして、世界中の認証済み人間から回答を受け取りましょう。認証済みアイデンティティに紐づいた写真優先の投稿を共有しましょう。WLD決済を使った信頼優先のマーケットプレイスで近くのアイテムを売買しましょう。毎月キュレートされた人間のストーリーを読みましょう。ヒューマンパスポートを構築しましょう — リアルタイムの信頼スコア、ストリーク、バッジ履歴、HPポイント。\n\nHumanChainは13言語で利用可能で、180以上の国々の認証済み人間にサービスを提供しています。",
    description_how_it_works:
      "World IDウォレットで一度サインインしてください。認証により、5つのコア機能が即座にアンロックされます：\n\n質問 — グローバルな認証済み人間コミュニティに質問を投稿してください。毎日の質問に答えて+18 HPを獲得しましょう。\n\nモーメント — 認証済みユーザー名で写真優先の投稿を共有しましょう。匿名投稿はありません。\n\nマーケット — 3枚の写真、状態メモ、固定WLD価格でアイテムをリスト登録しましょう。購入者は無料で閲覧できます。\n\nストーリー — アイデンティティ、移住、信仰、お金、愛、目的についての毎月キュレートされたストーリーを読みましょう。\n\nパスポート — ヒューマンスコア、ストリーク、HPレジャー、バッジをライブ信頼アイデンティティとして追跡しましょう。紹介リンクを共有して+50 HP/認証済み参加を獲得しましょう。",
    description_connect:
      "HumanChainは、公開アクションが許可される前にすべてのユーザーが唯一の本物の人間であることを確認するために、World ID Sign-In with Ethereum（SIWE）を使用します。ボットなし。重複アカウントなし。\n\nウォレットアドレスは公開されることはありません — Worldユーザー名のみが表示されます。いつでもWorld Appの設定からHumanChainのアクセスを取り消すことができます。\n\nWLD決済はWorld Appのネイティブ決済システムを通じて処理されます。通知は機能的なもののみです：毎日のリマインダー、入札アラート、決済確認、アカウントセキュリティアラート。",
  },
  {
    locale: "zh",
    name: "HumanChain",
    short_name: "HumanChain",
    world_app_button_text: "打开HumanChain",
    world_app_description:
      "唯一一个每位用户都是经过认证的真实人类的社交网络。提问、发帖、交易，构建你的信任护照——在World App内。",
    description_overview:
      "HumanChain是专门在World App内构建的认证人类社交网络。每位用户都通过World ID确认为唯一的真实人物——使其成为第一个机器人、虚假账户和重复身份在结构上不可能存在的平台。\n\n提出真实问题，从全球认证人类那里获得回答。分享与您的认证身份绑定的照片优先动态。通过WLD支付驱动的信任优先市场购买和出售附近商品。阅读每月精选的人类故事。构建您的人类护照——实时信任评分、连续打卡、徽章历史、HP积分以及随每次诚实行动增长的声誉记录。\n\nHumanChain提供13种语言版本，服务全球180多个国家的认证人类。",
    description_how_it_works:
      "使用您的World ID钱包登录一次，验证即可立即解锁五项核心功能：\n\n提问——向全球认证人类社区发布问题。回答每日问题获得+18 HP。\n\n动态——使用您的认证用户名分享照片优先帖子。无匿名发帖。\n\n市场——以三张照片、状态备注和固定WLD价格上架商品。买家免费浏览。卖家支付少量WLD费用。\n\n故事——阅读由真实认证人类撰写的每月精选故事。\n\n护照——跟踪您的人类评分、连续打卡、HP账本和徽章。分享推荐链接，每次认证加入可获得+50 HP。",
    description_connect:
      "HumanChain使用World ID Sign-In with Ethereum（SIWE）验证每位用户都是唯一的真实人类。无机器人。无重复账户。\n\n您的钱包地址永远不会公开显示——只有您的World用户名会出现在问题、故事和市场列表中。您可以随时从World App设置中撤销HumanChain的访问权限。\n\nWLD支付通过World App的原生支付系统处理。通知仅限功能性：每日提醒、出价提醒、支付确认和账户安全提醒。",
  },
  {
    locale: "ko",
    name: "HumanChain",
    short_name: "HumanChain",
    world_app_button_text: "HumanChain 열기",
    world_app_description:
      "모든 사용자가 검증된 실제 인간인 유일한 소셜 네트워크. 질문하고, 게시하고, 거래하고, 신뢰 여권을 만드세요 — World App 안에서.",
    description_overview:
      "HumanChain은 World App 내에서만 구축된 검증된 인간 소셜 네트워크입니다. 모든 사용자는 World ID를 통해 고유하고 실제 사람임이 확인됩니다 — 봇, 가짜 계정, 중복 신원이 구조적으로 불가능한 최초의 플랫폼입니다.\n\n실제 질문을 하고 전 세계 검증된 인간들로부터 답변을 받으세요. 검증된 신원과 연결된 사진 중심 순간을 공유하세요. WLD 결제로 구동되는 신뢰 우선 마켓플레이스를 통해 근처 물건을 사고파세요. 매월 큐레이션된 인간 이야기를 읽으세요. 인간 여권을 만드세요 — 실시간 신뢰 점수, 스트릭, 배지 기록, HP 포인트.\n\nHumanChain은 13개 언어로 제공되며 180개 이상의 국가에서 검증된 인간들에게 서비스를 제공합니다.",
    description_how_it_works:
      "World ID 지갑으로 한 번 로그인하세요. 인증하면 5가지 핵심 기능이 즉시 잠금 해제됩니다:\n\n질문 — 글로벌 검증 인간 커뮤니티에 질문을 게시하세요. 매일 질문에 답변하여 +18 HP를 획득하세요.\n\n모먼트 — 검증된 사용자 이름으로 사진 중심 게시물을 공유하세요. 익명 게시물이 없습니다.\n\n마켓 — 세 장의 사진, 상태 메모, 고정 WLD 가격으로 물건을 등록하세요. 구매자는 무료로 탐색합니다.\n\n스토리 — 신원, 이민, 신앙, 돈, 사랑, 목적에 관해 실제 검증된 인간이 쓴 매월 큐레이션된 이야기를 읽으세요.\n\n여권 — 인간 점수, 스트릭, HP 장부, 배지를 실시간 신뢰 신원으로 추적하세요. 추천 링크로 +50 HP/검증된 가입을 획득하세요.",
    description_connect:
      "HumanChain은 모든 사용자가 고유하고 실제 인간임을 확인하기 위해 World ID Sign-In with Ethereum(SIWE)을 사용합니다. 봇 없음. 중복 계정 없음.\n\n지갑 주소는 절대 공개적으로 표시되지 않습니다 — World 사용자 이름만 나타납니다. World App 설정에서 언제든지 HumanChain의 접근 권한을 취소할 수 있습니다.\n\nWLD 결제는 World App의 기본 결제 시스템을 통해 처리됩니다. 알림은 기능적인 것만 해당합니다: 일일 알림, 입찰 알림, 결제 확인 및 계정 보안 알림.",
  },
];

// ── Portal API endpoints to try ───────────────────────────────────────────────
const ENDPOINTS = [
  `https://developer.worldcoin.org/api/v1/preregistration/${APP_ID}`,
  `https://developer.worldcoin.org/api/v2/preregistration/${APP_ID}`,
];

async function trySetLocalisations() {
  console.log(`\nSetting localisations for ${APP_ID}`);
  console.log(`Languages: ${localisations.map(l => l.locale).join(", ")}\n`);

  for (const endpoint of ENDPOINTS) {
    console.log(`Trying: PATCH ${endpoint}`);
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({ localisations }),
      });
      const text = await res.text();
      console.log(`  Status: ${res.status}`);
      if (res.ok) {
        console.log("  ✅ Success!");
        console.log("  Response:", text.slice(0, 200));
        return true;
      } else {
        console.log("  ❌ Failed:", text.slice(0, 300));
      }
    } catch (e) {
      console.log(`  ❌ Error: ${e.message}`);
    }
  }

  // Fallback: try per-locale upsert
  console.log("\nTrying per-locale upsert...");
  let successCount = 0;
  for (const loc of localisations) {
    const url = `https://developer.worldcoin.org/api/v1/preregistration/${APP_ID}/localisations/${loc.locale}`;
    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify(loc),
      });
      if (res.ok) {
        console.log(`  ✅ ${loc.locale} — ${loc.world_app_button_text}`);
        successCount++;
      } else {
        const text = await res.text();
        console.log(`  ❌ ${loc.locale} — ${res.status}: ${text.slice(0, 120)}`);
      }
    } catch (e) {
      console.log(`  ❌ ${loc.locale} — Error: ${e.message}`);
    }
  }
  return successCount > 0;
}

// ── Also try Hasura GraphQL ────────────────────────────────────────────────────
async function tryGraphQL() {
  console.log("\nTrying Hasura GraphQL upsert...");
  const url = "https://developer.worldcoin.org/api/v1/graphql";

  const mutation = `
    mutation UpsertLocalisations($objects: [localisations_insert_input!]!) {
      insert_localisations(
        objects: $objects,
        on_conflict: {
          constraint: localisations_app_metadata_id_locale_key,
          update_columns: [name, short_name, world_app_description, world_app_button_text,
                           description_overview, description_how_it_works, description_connect]
        }
      ) { affected_rows }
    }
  `;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        query: mutation,
        variables: { objects: localisations },
      }),
    });
    const data = await res.json();
    console.log("  GraphQL response:", JSON.stringify(data).slice(0, 300));
    return res.ok && !data.errors;
  } catch (e) {
    console.log(`  GraphQL error: ${e.message}`);
    return false;
  }
}

async function main() {
  const ok1 = await trySetLocalisations();
  if (!ok1) await tryGraphQL();

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If all API attempts failed, update manually in the portal:
  1. Go to: developer.worldcoin.org
  2. Select HumanChain → App Metadata → Languages
  3. For each language tab, paste the content from this script
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

main().catch(console.error);
