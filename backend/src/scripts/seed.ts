import * as admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID!;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL!;
const privateKey = process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n");

admin.initializeApp({
  credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
});

const firestore = admin.firestore();
const auth = admin.auth();

const seedProducts = [
  {
    id: "1",
    name: "VX Social Business",
    category: "Kurumsal İletişim Platformu",
    price: 1299,
    description:
      "Merkez ofisiniz ile saha personeliniz arasındaki etkileşimi tek bir noktadan, etkili bir şekilde yönetin. Etkinlikler, paylaşımlar, makaleler, anketler ve geri bildirim özellikleri sunan bu bulut tabanlı platform sayesinde kurum içi iletişiminizi zirveye taşıyın ve ekip bağlarınızı güçlendirin.",
  },
  {
    id: "2",
    name: "VX Stream",
    category: "Uçtan Uca Dijital Yayın (OTT) Çözümü",
    price: 2499,
    description:
      "Kullanıcılarınıza diledikleri zaman, diledikleri içeriği izleme özgürlüğü sunun. Android, Apple, Web, LG ve Samsung Smart TV'ler (Çok yakında Android TV ve Apple TV) gibi birçok platformla tam uyumlu çalışan istemci uygulamalarımızla, kendi dijital yayın platformunuzu kesintisiz bir deneyimle hayata geçirin.",
  },
  {
    id: "3",
    name: "VX Notifier",
    category: "Akıllı Bildirim Yöneticisi",
    price: 649,
    description:
      "Tüm bildirim süreçlerinizde kontrolü elinize alın. VX Notifier ile Push (Anlık bildirim) ve E-posta şablonlarınızı tek bir merkezden yönetin, gönderilen bildirimlerin durumunu anlık sorgulayın. Parametrik yapısı sayesinde bildirim gönderim kurallarınızı markanıza özel olarak esnekçe tanımlayın.",
  },
  {
    id: "4",
    name: "VX Roll Call",
    category: "Yeni Nesil Yoklama Sistemi",
    price: 1799,
    description:
      "Üniversiteler ve eğitim kurumları için özel olarak geliştirilmiş ders katılım ve takip sistemi. Beacon, RFID ve IoT teknolojilerini destekleyen yapısıyla, kurumunuzun mevcut mobil uygulamasına entegre edilebileceği gibi, bağımsız bir uygulama olarak da kullanılarak yoklama süreçlerini tamamen dijitalleştirir.",
  },
  {
    id: "5",
    name: "VX Payment Gateway (VXPG)",
    category: "Güvenli Ödeme Geçidi",
    price: 349,
    description:
      "VXPG ile yapacağınız tek bir entegrasyon sayesinde sayısız ödeme kanalına anında erişim sağlayın. Abonelik planları, fiziksel ürün satışları veya dijital içerik satışları gibi tüm tahsilat süreçlerinizi, iş modelinize özel olarak uyarlanabilen bu güvenli altyapı ile sorunsuz bir şekilde yönetin.",
  },
  {
    id: "6",
    name: "VX Subscription",
    category: "Abonelik Yönetim Sistemi",
    price: 189,
    description:
      "Kullanıcı deneyimini sadeliğe kavuşturun. Müşterilerinizin birden fazla abonelik paketini tek bir hesap üzerinden, karmaşadan uzak ve son derece kolay bir şekilde yönetmesini sağlayan akıllı abonelik çözümümüz.",
  },
  {
    id: "7",
    name: "VX Organization Scan",
    category: "Organizasyonel Gelişim Analizi",
    price: 279,
    description:
      "Kurumunuzdaki ekiplerin gelişimini sadece tahmin etmeyin, ölçün! Ekiplerin performansını ve gelişimini çeşitli boyutlarla ölçerek karşılaştırmalı veriler sunan bu sistemle, şirket içi yetenek yönetimini ve büyüme stratejilerinizi veri odaklı bir temele oturtun.",
  },
  {
    id: "8",
    name: "VX Assessment Platform",
    category: "Dinamik Ölçme ve Değerlendirme",
    price: 3299,
    description:
      "Şirketiniz için tasarlanmış en verimli anket ve ölçümleme aracı. Dinamik ölçümler oluşturmak, anketler göndermek ve sonuçları analiz etmek artık çok kolay. Sorular üzerinde kurgulanabilen esnek formüller ve rol bazlı ölçümler sayesinde ekiplerinizi verilerle değerlendirin ve geliştirin.",
  },
  {
    id: "9",
    name: "VX Player Analytics",
    category: "Kapsamlı Oynatıcı Analitiği",
    price: 899,
    description:
      "Ses ve video oynatıcılarınızdan (Audio/Video Player) gelen verileri tek bir platformda toplayın, işleyin ve raporlayın. Kullanıcıların içerik tüketim alışkanlıklarını derinlemesine analiz ederek, içerik stratejilerinize yön verecek en değerli içgörüleri elde edin.",
  },
];

async function seedProductCatalog() {
  const productsCollection = firestore.collection("products");
  const existing = await productsCollection.limit(1).get();

  if (!existing.empty) {
    console.log("Ürün koleksiyonu zaten dolu, seed atlanıyor.");
    return;
  }

  const now = new Date().toISOString();
  const batch = firestore.batch();

  for (const product of seedProducts) {
    batch.set(productsCollection.doc(product.id), {
      ...product,
      createdAt: now,
      updatedAt: now,
    });
  }

  await batch.commit();
  console.log(`${seedProducts.length} ürün Firestore'a eklendi.`);
}

async function seedAdminUser() {
  const email = process.env.ADMIN_BOOTSTRAP_EMAIL;
  const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;

  if (!email || !password) {
    console.log("ADMIN_BOOTSTRAP_EMAIL/PASSWORD tanımlı değil, admin kullanıcı seed'i atlanıyor.");
    return;
  }

  let userRecord: admin.auth.UserRecord;
  try {
    userRecord = await auth.getUserByEmail(email);
    console.log(`Admin kullanıcısı zaten mevcut: ${email}`);
  } catch {
    userRecord = await auth.createUser({ email, password, emailVerified: true });
    console.log(`Admin kullanıcısı oluşturuldu: ${email}`);
  }

  await auth.setCustomUserClaims(userRecord.uid, { admin: true });
  await auth.updateUser(userRecord.uid, { displayName: "Admin" });

  const now = new Date().toISOString();
  await firestore.collection("users").doc(userRecord.uid).set(
    {
      uid: userRecord.uid,
      email,
      fullName: "Admin",
      role: "admin",
      disabled: false,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true },
  );

  console.log("Admin kullanıcısına 'admin' custom claim'i atandı.");
}

async function main() {
  await seedProductCatalog();
  await seedAdminUser();
  console.log("Seed işlemi tamamlandı.");
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed işlemi başarısız oldu:", error);
  process.exit(1);
});
