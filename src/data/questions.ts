import { Question } from '../types/game';

export const QUESTIONS: Question[] = [
  // Tahap 1: Mudah (1 - 6)
  {
    id: 1,
    stage: 1,
    stageTitle: 'TAHAP 1: MUDAH',
    stageSubtitle: 'Asas Kefahaman Kisah',
    text: 'Siapakah yang meminta pertolongan ketika dihempap oleh pokok?',
    options: {
      A: 'Sang Kancil',
      B: 'Sang Buaya',
      C: 'Sang Kerbau',
      D: 'Sang Harimau'
    },
    answer: 'B',
    explanation: 'Sang Buaya telah dihempap oleh batang pokok yang tumbang semasa sedang berehat di tebing sungai.'
  },
  {
    id: 2,
    stage: 1,
    stageTitle: 'TAHAP 1: MUDAH',
    stageSubtitle: 'Asas Kefahaman Kisah',
    text: 'Apakah yang menghempap Sang Buaya?',
    options: {
      A: 'Batu besar',
      B: 'Ranting kecil',
      C: 'Pokok tumbang',
      D: 'Batang buluh'
    },
    answer: 'C',
    explanation: 'Batang pokok yang tumbang telah menghempap ekor dan tubuh Sang Buaya hingga tidak dapat bergerak.'
  },
  {
    id: 3,
    stage: 1,
    stageTitle: 'TAHAP 1: MUDAH',
    stageSubtitle: 'Asas Kefahaman Kisah',
    text: 'Bagaimanakah Sang Kerbau membantu Sang Buaya?',
    options: {
      A: 'Mengangkat pokok menggunakan tanduknya',
      B: 'Memanggil Sang Kancil',
      C: 'Menarik Sang Buaya ke sungai',
      D: 'Mencari makanan untuk Sang Buaya'
    },
    answer: 'A',
    explanation: 'Sang Kerbau menggunakan tanduknya yang kuat untuk mengangkat batang pokok yang berat itu.'
  },
  {
    id: 4,
    stage: 1,
    stageTitle: 'TAHAP 1: MUDAH',
    stageSubtitle: 'Asas Kefahaman Kisah',
    text: 'Apakah tindakan Sang Buaya selepas dibantu oleh Sang Kerbau?',
    options: {
      A: 'Mengucapkan terima kasih',
      B: 'Melarikan diri ke hutan',
      C: 'Menggigit kaki Sang Kerbau',
      D: 'Membantu Sang Kerbau pula'
    },
    answer: 'C',
    explanation: 'Sebaik sahaja bebas, Sang Buaya yang tamak dan tidak mengenang budi telah menggigit kaki Sang Kerbau.'
  },
  {
    id: 5,
    stage: 1,
    stageTitle: 'TAHAP 1: MUDAH',
    stageSubtitle: 'Asas Kefahaman Kisah',
    text: 'Siapakah yang datang membantu Sang Kerbau ketika dia dalam kesusahan?',
    options: {
      A: 'Sang Harimau',
      B: 'Sang Kancil',
      C: 'Sang Gajah',
      D: 'Sang Monyet'
    },
    answer: 'B',
    explanation: 'Sang Kancil yang terkenal dengan kebijaksanaannya telah lalu di situ dan mendengar rayuan Sang Kerbau.'
  },
  {
    id: 6,
    stage: 1,
    stageTitle: 'TAHAP 1: MUDAH',
    stageSubtitle: 'Asas Kefahaman Kisah',
    text: 'Apakah yang dilakukan oleh Sang Kancil untuk menyelamatkan Sang Kerbau?',
    options: {
      A: 'Menggunakan kebijaksanaan untuk memperdaya Sang Buaya',
      B: 'Melawan Sang Buaya dengan kekuatan',
      C: 'Meminta Sang Kerbau melarikan diri sendirian',
      D: 'Membiarkan Sang Kerbau dalam kesusahan'
    },
    answer: 'A',
    explanation: 'Sang Kancil menggunakan akal fikirannya dengan meminta mereka melakonkan semula kejadian asal.'
  },

  // Tahap 2: Sederhana (7 - 8)
  {
    id: 7,
    stage: 2,
    stageTitle: 'TAHAP 2: SEDERHANA',
    stageSubtitle: 'Analisis Watak & Perwatakan',
    text: 'Berdasarkan ilustrasi Sang Buaya menggigit kaki Sang Kerbau, apakah yang dapat kita fahami tentang sikap Sang Buaya?',
    options: {
      A: 'Sang Buaya sangat menghargai pertolongan.',
      B: 'Sang Buaya tidak mengenang budi.',
      C: 'Sang Buaya takut akan Sang Kerbau.',
      D: 'Sang Buaya ingin berkawan dengan Sang Kerbau.'
    },
    answer: 'B',
    explanation: 'Tindakan membalas kebaikan dengan kejahatan menunjukkan sikap Sang Buaya yang tidak tahu berterima kasih dan tidak mengenang budi.'
  },
  {
    id: 8,
    stage: 2,
    stageTitle: 'TAHAP 2: SEDERHANA',
    stageSubtitle: 'Analisis Watak & Perwatakan',
    text: 'Mengapakah Sang Kancil meminta Sang Buaya mengulangi keadaan ketika dihempap pokok?',
    options: {
      A: 'Untuk membantu Sang Buaya berehat.',
      B: 'Untuk menguji kekuatan Sang Kerbau.',
      C: 'Untuk memerangkap Sang Buaya semula dan menyelamatkan Sang Kerbau.',
      D: 'Untuk membolehkan mereka bermain bersama-sama.'
    },
    answer: 'C',
    explanation: 'Sang Kancil berpura-pura tidak percaya bagaimana Sang Kerbau dapat mengangkat pokok itu agar Sang Buaya melepaskan gigitan dan masuk kembali di bawah pokok.'
  },

  // Tahap 3: Sukar (9 - 10)
  {
    id: 9,
    stage: 3,
    stageTitle: 'TAHAP 3: SUKAR',
    stageSubtitle: 'KBAT & Nilai Murni',
    text: 'Jika kamu melihat ilustrasi Sang Kancil menunjukkan pokok kepada Sang Buaya, apakah kesimpulan paling tepat tentang rancangan Sang Kancil?',
    options: {
      A: 'Sang Kancil mahu membantu Sang Buaya mendapatkan makanan.',
      B: 'Sang Kancil mahu mengembalikan keadaan asal supaya Sang Buaya terperangkap semula.',
      C: 'Sang Kancil mahu Sang Kerbau mengangkat pokok itu berkali-kali.',
      D: 'Sang Kancil mahu meninggalkan Sang Kerbau bersama Sang Buaya.'
    },
    answer: 'B',
    explanation: 'Rancangan bijak Sang Kancil adalah mengembalikan situasi asal di mana pokok itu kembali menimpa Sang Buaya agar Sang Kerbau dapat melarikan diri.'
  },
  {
    id: 10,
    stage: 3,
    stageTitle: 'TAHAP 3: SUKAR',
    stageSubtitle: 'KBAT & Nilai Murni',
    text: 'Apakah pengajaran utama yang dapat dirumuskan daripada keseluruhan cerita berdasarkan tindakan watak-wataknya?',
    options: {
      A: 'Kita hendaklah menggunakan kekuatan untuk menyelesaikan semua masalah.',
      B: 'Kita hendaklah sentiasa mempercayai semua pihak tanpa berfikir.',
      C: 'Kita hendaklah mengenang budi, berwaspada dan menggunakan kebijaksanaan ketika menghadapi masalah.',
      D: 'Kita hendaklah membalas setiap perbuatan buruk dengan perbuatan yang lebih buruk.'
    },
    answer: 'C',
    explanation: 'Pengajaran utama ialah kita wajib membalas budi baik orang lain, sentiasa berhati-hati, dan menggunakan akal fikiran (kebijaksanaan) untuk mengatasi bahaya.'
  }
];

export const FOLKLORE_STORY = {
  title: 'Kisah Sang Kancil, Sang Buaya & Sang Kerbau',
  synopsis: `Pada suatu hari yang hening di rimba, sebatang pokok besar telah tumbang lalu menghempap seekor buaya yang sedang berehat di tebing sungai. Sang Buaya mengerang kesakitan dan merayu pertolongan daripada haiwan-haiwan di sekelilingnya.

Tidak lama kemudian, Sang Kerbau yang berhati mulia lalu di tempat kejadian. Mendengar rintihan Sang Buaya, Sang Kerbau berasa amat kasihan lalu menggunakan tanduknya yang gagah untuk mengangkat pokok tumbang tersebut sehingga Sang Buaya berjaya keluar.

Namun, sebaik sahaja terselamat, Sang Buaya yang khianat dan lapar terus menyambar lalu menggigit salah satu kaki Sang Kerbau. Sang Kerbau terkejut dan merayu agar dilepaskan, namun Sang Buaya enggan dan mendakwa rezeki di hadapan mata tidak patut dilepaskan.

Kebetulan pada waktu itu, Sang Kancil yang cerdik sedang melintas. Setelah mendengar aduan daripada kedua-dua pihak, Sang Kancil tersenyum dan berkata bahawa dia tidak boleh membuat keputusan yang adil selagi tidak melihat sendiri bagaimana kejadian itu sebenarnya bermula.

Atas desakan Sang Kancil, Sang Buaya bersetuju melepaskan gigitannya dan merangkak semula ke bawah batang pokok, manakala Sang Kerbau meletakkan semula pokok itu ke atas belakang Sang Buaya.

Sebaik sahaja Sang Buaya terperangkap semula seperti asal, Sang Kancil segera mengajak Sang Kerbau berlalu pergi meninggalkan Sang Buaya yang tamak dan tidak tahu mengenang budi itu.`,
  moralValues: [
    'Mengenang Budi: Jangan sesekali mengkhianati pihak yang telah menyelamatkan atau menolong kita.',
    'Kebijaksanaan Mengatasi Kekuatan: Akal fikiran yang tajam dapat menyelesaikan masalah rumit yang tidak mampu diselesaikan dengan kekerasan fizikal semata-mata.',
    'Beringat & Berwaspada: Sentiasa berwaspada dan bersiap sedia walaupun ketika kita berniat baik membantu orang lain.'
  ]
};
