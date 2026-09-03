import { useState, useEffect, useRef } from 'react';
import { WheelItem, WheelConfig, WinnerRecord } from './types';
import { soundManager } from './utils/sound';
import confetti from 'canvas-confetti';
import { Menu, X, Plus, Trash2, Play, Sparkles, Trophy, History, Settings, Volume2, VolumeX, RotateCcw, Timer, Flag, MessageSquare, Hash, List, Home, CheckCircle } from 'lucide-react';

interface QuestionWithAnswer {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

const DEFAULT_QUESTIONS: QuestionWithAnswer[] = [
  { id: '1', question: 'في أي يوم وشهر نحتفل باليوم الوطني السعودي؟', answer: '23 سبتمبر', category: 'وطني' },
  { id: '2', question: 'من هو الملك الذي أسس ووحد المملكة العربية السعودية؟', answer: 'الملك عبدالعزيز بن عبدالرحمن آل سعود', category: 'تاريخ' },
  { id: '3', question: 'ما هي عاصمة المملكة العربية السعودية؟', answer: 'مدينة الرياض', category: 'جغرافيا' },
  { id: '4', question: 'ما هما اللونان الأساسيان في علم المملكة العربية السعودية؟', answer: 'الأخضر والأبيض', category: 'وطني' },
  { id: '5', question: 'ما هي العبارة العظيمة المكتوبة على العلم السعودي؟', answer: 'لا إله إلا الله محمد رسول الله', category: 'دين' },
  { id: '6', question: 'ماذا يرمز السيف في علم المملكة؟', answer: 'القوة والعدل', category: 'وطني' },
  { id: '7', question: 'ماذا ترمز النخلة في شعار المملكة؟', answer: 'النماء والخير والرخاء', category: 'وطني' },
  { id: '8', question: 'كم عدد السيوف في شعار المملكة العربية السعودية؟', answer: 'سيفان متقاطعان', category: 'وطني' },
  { id: '9', question: 'من هو خادم الحرمين الشريفين الملك الحالي للمملكة؟', answer: 'الملك سلمان بن عبدالعزيز آل سعود', category: 'حكام' },
  { id: '10', question: 'من هو ولي العهد السعودي الذي أطلق رؤية 2030؟', answer: 'الأمير محمد بن سلمان بن عبدالعزيز', category: 'حكام' },
  { id: '11', question: 'ما هو اسم الحصن القديم الذي دخله الملك عبدالعزيز لاسترداد الرياض؟', answer: 'حصن المصمك', category: 'تاريخ' },
  { id: '12', question: 'ما هو الحيوان الذي يعيش في الصحراء ويُعد رمزاً للتراث السعودي؟', answer: 'الجمل (الإبل)', category: 'تراث' },
  { id: '13', question: 'ما هو الطائر الجارح الذي يشتهر به السعوديون ويُعد رمزاً للقوة؟', answer: 'الصقر', category: 'تراث' },
  { id: '14', question: 'ما هي الرقصة الشعبية الرسمية التي تُؤدى بالسيوف في اليوم الوطني؟', answer: 'العرضة السعودية', category: 'تراث' },
  { id: '15', question: 'لماذا يُمنع إنزال (تنكيس) العلم السعودي إلى النصف أبداً؟', answer: 'لوجود كلمة التوحيد (لا إله إلا الله) عليه', category: 'وطني' },
  { id: '16', question: 'ما هي الكلمة الأولى التي يبدأ بها النشيد الوطني السعودي؟', answer: 'سارعي', category: 'وطني' },
  { id: '17', question: 'ما هي الكلمة الأخيرة التي ينتهي بها النشيد الوطني السعودي؟', answer: 'الوطن', category: 'وطني' },
  { id: '18', question: 'أين ولد الملك عبدالعزيز آل سعود؟', answer: 'في مدينة الرياض', category: 'تاريخ' },
  { id: '19', question: 'في أي عام هجري تم استرداد مدينة الرياض؟', answer: 'عام 1319هـ', category: 'تاريخ' },
  { id: '20', question: 'كم عدد المناطق الإدارية في المملكة العربية السعودية؟', answer: '13 منطقة إدارية', category: 'جغرافيا' },
  { id: '21', question: 'ما هما المدينتان المقدستان في المملكة؟', answer: 'مكة المكرمة والمدينة المنورة', category: 'دين' },
  { id: '22', question: 'ما هو اسم المشروع الضخم والمدينة المستقبلية في شمال غرب المملكة؟', answer: 'مشروع نيوم (NEOM)', category: 'رؤية' },
  { id: '23', question: 'ما هو اسم الخطوط الجوية الرسمية للمملكة؟', answer: 'الخطوط الجوية العربية السعودية (السعودية)', category: 'اقتصاد' },
  { id: '24', question: 'كم عدد الملوك الذين حكموا المملكة بعد الملك عبدالعزيز؟', answer: '6 ملوك', category: 'حكام' },
  { id: '25', question: 'من هو أول ملك تولى الحكم بعد وفاة الملك عبدالعزيز؟', answer: 'الملك سعود بن عبدالعزيز', category: 'حكام' },
  { id: '26', question: 'من هو أول رائد فضاء سعودي وعربي؟', answer: 'الأمير سلطان بن سلمان', category: 'علوم' },
  { id: '27', question: 'من هي أول رائدة فضاء سعودية صعدت للفضاء مؤخراً؟', answer: 'ريانة برناوي', category: 'علوم' },
  { id: '28', question: 'ما هو اسم الغطاء الرأسي (الأحمر والأبيض) الذي يرتديه الرجل السعودي؟', answer: 'الشماغ', category: 'تراث' },
  { id: '29', question: 'ما هو اسم الدائرة السوداء التي توضع فوق الشماغ؟', answer: 'العقال', category: 'تراث' },
  { id: '30', question: 'ما هو البحر الذي يقع في غرب المملكة العربية السعودية؟', answer: 'البحر الأحمر', category: 'جغرافيا' },
  { id: '31', question: 'ما هو الخليج الذي يقع في شرق المملكة؟', answer: 'الخليج العربي', category: 'جغرافيا' },
  { id: '32', question: 'ما هو اسم أكبر صحراء رملية في المملكة؟', answer: 'صحراء الربع الخالي', category: 'جغرافيا' },
  { id: '33', question: 'ما هي الأكلة الشعبية الأولى والأشهر في السعودية والمكونة من الرز واللحم أو الدجاج؟', answer: 'الكبسة', category: 'تراث' },
  { id: '34', question: 'ما هو الجسر الشهير الذي يربط السعودية بمملكة البحرين؟', answer: 'جسر الملك فهد', category: 'معالم' },
  { id: '35', question: 'من هو الملك الذي سُمي الجسر الرابط بين السعودية والبحرين باسمه؟', answer: 'الملك فهد بن عبدالعزيز', category: 'حكام' },
  { id: '36', question: 'من هو الملك الذي سُمح في عهده للمرأة بقيادة السيارة؟', answer: 'الملك سلمان بن عبدالعزيز', category: 'حكام' },
  { id: '37', question: 'ما هو اللقب الذي يطلق على ملوك السعودية منذ عهد الملك فهد؟', answer: 'خادم الحرمين الشريفين', category: 'حكام' },
  { id: '38', question: 'ما هي الأداة التي يمسكها الرجال بأيديهم أثناء أداء العرضة السعودية؟', answer: 'السيف', category: 'تراث' },
  { id: '39', question: 'ما هي أكبر واحة نخيل في السعودية وتوجد في المنطقة الشرقية؟', answer: 'واحة الأحساء', category: 'جغرافيا' },
  { id: '40', question: 'ما هي الشجرة التي تُعد الشجرة الوطنية للمملكة؟', answer: 'النخلة', category: 'وطني' },
  { id: '41', question: 'ما هو اللقب الذي يُطلق على المنتخب السعودي لكرة القدم؟', answer: 'الصقور الخضر (أو الأخضر)', category: 'رياضة' },
  { id: '42', question: 'ما هو اللون الذي يلبسه معظم الناس ويزين الشوارع في اليوم الوطني؟', answer: 'اللون الأخضر', category: 'وطني' },
  { id: '43', question: 'ما هي اسم المدينة الخطية (التي تأتي على شكل خط مستقيم) في مشروع نيوم؟', answer: 'ذا لاين (The Line)', category: 'رؤية' },
  { id: '44', question: 'ما هو المشروب الساخن الذي يُقدم للضيوف ويُعد رمزاً للكرم السعودي؟', answer: 'القهوة السعودية', category: 'تراث' },
  { id: '45', question: 'من هو الملك الذي اهتم كثيراً بطباعة المصحف الشريف وأنشأ مجمعاً لذلك في المدينة المنورة؟', answer: 'الملك فهد بن عبدالعزيز', category: 'حكام' },
  { id: '46', question: 'ما هي المنطقة التي تشتهر بزراعة الورد في السعودية (مدينة الورود)؟', answer: 'مدينة الطائف', category: 'جغرافيا' },
  { id: '47', question: 'ما هو الشهر الميلادي الذي نحتفل فيه دائماً باليوم الوطني؟', answer: 'شهر سبتمبر', category: 'وطني' },
  { id: '48', question: 'هل اليوم الوطني السعودي يعتبر إجازة رسمية للمدارس والموظفين؟', answer: 'نعم، إجازة رسمية', category: 'وطني' },
  { id: '49', question: 'إلى أي اتجاه يتجه المسلمون في جميع أنحاء العالم للصلاة (وتقع في السعودية)؟', answer: 'الكعبة المشرفة في مكة المكرمة', category: 'دين' },
  { id: '50', question: 'ما هي العبارة التي نرددها دائماً لتهنئة الوطن في عيده؟', answer: 'دام عزك يا وطن (أو كل عام والوطن بخير)', category: 'وطني' },
  { id: '51', question: 'ما هي أكبر منطقة في المملكة العربية السعودية من حيث المساحة؟', answer: 'المنطقة الشرقية', category: 'جغرافيا' },
  { id: '52', question: 'ما هي أصغر منطقة في المملكة العربية السعودية من حيث المساحة؟', answer: 'منطقة الباحة', category: 'جغرافيا' },
  { id: '53', question: 'ما هي المدينة السعودية التي تُلقب بـ "عروس البحر الأحمر"؟', answer: 'مدينة جدة', category: 'جغرافيا' },
  { id: '54', question: 'ما هو اللون الذي يُميز جواز السفر السعودي؟', answer: 'اللون الأخضر', category: 'وطني' },
  { id: '55', question: 'ما هي العملة الرسمية في المملكة العربية السعودية؟', answer: 'الريال السعودي', category: 'اقتصاد' },
  { id: '56', question: 'كم هللة يوجد في الريال السعودي الواحد؟', answer: '100 هللة', category: 'اقتصاد' },
  { id: '57', question: 'ما هو الحيوان الذي يُسمى "سفينة الصحراء" ونعتز به في تراثنا؟', answer: 'الجمل (الإبل)', category: 'تراث' },
  { id: '58', question: 'أين توجد الكعبة المشرفة في السعودية؟', answer: 'في مكة المكرمة', category: 'دين' },
  { id: '59', question: 'أين يوجد المسجد النبوي الشريف في السعودية؟', answer: 'في المدينة المنورة', category: 'دين' },
  { id: '60', question: 'ما هي المدينة التي تتميز بجوها البارد وتقع في جبال عسير؟', answer: 'مدينة أبها', category: 'جغرافيا' },
  { id: '61', question: 'ماذا يُسمى اللباس الأسود الذي ترتديه المرأة السعودية فوق ملابسها؟', answer: 'العباءة', category: 'تراث' },
  { id: '62', question: 'بأي يد يُمسك الرجل فنجان القهوة السعودية عند تقديمه للضيوف؟', answer: 'باليد اليمنى', category: 'تراث' },
  { id: '63', question: 'ماذا تفعل بفنجان القهوة السعودية إذا أردت أن تخبر المضيف أنك اكتفيت؟', answer: 'نهز الفنجان', category: 'تراث' },
  { id: '64', question: 'ما هي الرياضة التراثية التي يُستخدم فيها "الصقر" للصيد؟', answer: 'الصقارة (صيد الصقور)', category: 'تراث' },
  { id: '65', question: 'ما هو الترتيب الحالي للملك سلمان بن عبدالعزيز بين ملوك السعودية؟', answer: 'السابع (الملك السابع)', category: 'حكام' },
  { id: '66', question: 'ما هو لون الزي العسكري البري (المموه) للجنود السعوديين؟', answer: 'أخضر وبني (مموه)', category: 'عسكري' },
  { id: '67', question: 'ما هو اسم المطار الدولي الكبير في مدينة الرياض؟', answer: 'مطار الملك خالد الدولي', category: 'معالم' },
  { id: '68', question: 'ما هو اسم المطار الدولي الكبير في مدينة جدة؟', answer: 'مطار الملك عبدالعزيز الدولي', category: 'معالم' },
  { id: '69', question: 'ما هي أكبر شركة نفط (بترول) في السعودية والعالم؟', answer: 'شركة أرامكو السعودية', category: 'اقتصاد' },
  { id: '70', question: 'ما هو المعدن الثمين جدًا الذي يُستخرج من "مهد الذهب" في السعودية؟', answer: 'الذهب', category: 'اقتصاد' },
  { id: '71', question: 'هل يوجد في العلم السعودي هلال أو نجمة؟', answer: 'لا (يوجد سيف فقط)', category: 'وطني' },
  { id: '72', question: 'ماذا يُسمى الحذاء التراثي الجلدي الذي يلبسه الرجال مع الثوب؟', answer: 'الزبيرية (أو النعال الشرقية)', category: 'تراث' },
  { id: '73', question: 'ما هو الجبل العظيم الذي يقف عليه الحجاج يوم 9 ذي الحجة؟', answer: 'جبل عرفات', category: 'دين' },
  { id: '74', question: 'ما هو الجبل الذي يوجد فيه "غار حراء" في مكة المكرمة؟', answer: 'جبل النور', category: 'دين' },
  { id: '75', question: 'ماذا يُسمى البرج الشهير في الرياض الذي يشبه فتاحة الزجاج من الأعلى؟', answer: 'برج المملكة', category: 'معالم' },
  { id: '76', question: 'ماذا يُسمى البرج الشهير في الرياض الذي يعلوه شكل كرة زجاجية؟', answer: 'برج الفيصلية', category: 'معالم' },
  { id: '77', question: 'ماذا تُسمى الخيمة التراثية التي كان يسكنها أهل البادية في السعودية؟', answer: 'بيت الشعر', category: 'تراث' },
  { id: '78', question: 'ماذا يُسمى الوعاء النحاسي أو الذهبي الذي تُطبخ وتُقدم فيه القهوة السعودية؟', answer: 'الدلة', category: 'تراث' },
  { id: '79', question: 'ماذا يُسمى الكوب الصغير جداً الذي نشرب فيه القهوة السعودية؟', answer: 'الفنجان', category: 'تراث' },
  { id: '80', question: 'ما هي الأكلة السعودية المشهورة في الشتاء والمصنوعة من التمر والدقيق؟', answer: 'الحنيني (أو القشد)', category: 'تراث' },
  { id: '81', question: 'ما هو الفصل من فصول السنة الذي يوافق اليوم الوطني (23 سبتمبر)؟', answer: 'فصل الخريف', category: 'وطني' },
  { id: '82', question: 'ما هو الرقم الذي احتفلنا به في اليوم الوطني لعام 2024م؟', answer: '94', category: 'وطني' },
  { id: '83', question: 'ما هي الكلمة المرادفة لكلمة "الوطن" ونستخدمها كثيراً في الأناشيد (مثل: هي لنا ...)؟', answer: 'الدار', category: 'وطني' },
  { id: '84', question: 'ماذا يوزع الطلاب في المدارس على بعضهم البعض احتفالاً باليوم الوطني؟', answer: 'الأعلام السعودية والهدايا', category: 'وطني' },
  { id: '85', question: 'هل نحتفل باليوم الوطني السعودي بالتقويم الميلادي أم الهجري؟', answer: 'بالتقويم الميلادي', category: 'وطني' },
  { id: '86', question: 'ماذا ترسم الطائرات العسكرية في السماء احتفالاً باليوم الوطني؟', answer: 'ألوان العلم السعودي (أخضر وأبيض)', category: 'وطني' },
  { id: '87', question: 'ما هو لون الإضاءة الذي تُضاء به الأبراج والمباني ليلة اليوم الوطني؟', answer: 'اللون الأخضر', category: 'وطني' },
  { id: '88', question: 'ما هو اسم المهرجان الترفيهي السنوي الضخم الذي يُقام في العاصمة الرياض؟', answer: 'موسم الرياض', category: 'ترفيه' },
  { id: '89', question: 'ما هو اسم المشروع الترفيهي والرياضي الكبير الذي يُبنى بالقرب من الرياض؟', answer: 'مشروع القدية', category: 'رؤية' },
  { id: '90', question: 'ماذا يُسمى الكورنيش والواجهة البحرية الشهيرة في مدينة جدة؟', answer: 'واجهة جدة البحرية', category: 'معالم' },
  { id: '91', question: 'ماذا يُسمى الحي التاريخي القديم في جدة والمشهور ببيوته التراثية؟', answer: 'جدة البلد (أو جدة التاريخية)', category: 'تراث' },
  { id: '92', question: 'ما هي المدينة السعودية القديمة في "العلا" المشهورة بالآثار والنقوش في الجبال؟', answer: 'مدائن صالح (الحجر)', category: 'تراث' },
  { id: '93', question: 'ما هو اسم الحي التاريخي في الدرعية الذي كان مقراً للحكم قديماً؟', answer: 'حي الطريف', category: 'تراث' },
  { id: '94', question: 'ما اسم الوادي الشهير الذي تقع عليه مدينة الدرعية والرياض؟', answer: 'وادي حنيفة', category: 'جغرافيا' },
  { id: '95', question: 'ما هي المنطقة السعودية المشهورة بزراعة التمور بأنواعها الكثيرة؟', answer: 'القصيم', category: 'جغرافيا' },
  { id: '96', question: 'ما هي المنطقة السعودية في الشمال المشهورة بزراعة الزيتون؟', answer: 'الجوف', category: 'جغرافيا' },
  { id: '97', question: 'في أي قارة من قارات العالم تقع المملكة العربية السعودية؟', answer: 'قارة آسيا', category: 'جغرافيا' },
  { id: '98', question: 'ما هي الدولة الخليجية التي تفصلنا عنها مياه ونذهب إليها عبر جسر الملك فهد؟', answer: 'مملكة البحرين', category: 'جغرافيا' },
  { id: '99', question: 'ما هي رؤية السعودية المستقبلية العظيمة؟', answer: 'رؤية 2030', category: 'رؤية' },
  { id: '100', question: 'ما هي الوزارة المسؤولة عن المدارس والطلاب والمعلمين في السعودية؟', answer: 'وزارة التعليم', category: 'حكومي' },
  { id: '101', question: 'ما هي الوزارة المسؤولة عن المستشفيات والأطباء في السعودية؟', answer: 'وزارة الصحة', category: 'حكومي' },
  { id: '102', question: 'ما هو رقم الطوارئ الأمني الموحد في المملكة العربية السعودية؟', answer: '911', category: 'حكومي' },
  { id: '103', question: 'ما هو رقم الاتصال الخاص بسيارات الإسعاف (الهلال الأحمر) في السعودية؟', answer: '997', category: 'حكومي' },
  { id: '104', question: 'ما هو رقم الاتصال الخاص بالدفاع المدني (الإطفاء) في السعودية؟', answer: '998', category: 'حكومي' },
  { id: '105', question: 'ماذا يُسمى رجال الأمن الذين ينظمون حركة السيارات في الشوارع؟', answer: 'المرور', category: 'حكومي' },
  { id: '106', question: 'ما هو القطار السريع الذي يربط بين مكة المكرمة والمدينة المنورة؟', answer: 'قطار الحرمين', category: 'معالم' },
  { id: '107', question: 'متى يُنشد الطلاب والطالبات النشيد الوطني في المدارس يومياً؟', answer: 'في الطابور الصباحي', category: 'وطني' },
  { id: '108', question: 'ما هو المعطف التراثي الشتوي المبطن بالصوف الذي يلبسه السعوديون للتدفئة؟', answer: 'الفروة', category: 'تراث' },
  { id: '109', question: 'ما هو العباءة الرسمية (البشت) التي يلبسها الرجال فوق الثوب في المناسبات؟', answer: 'البشت (المشلح)', category: 'تراث' },
  { id: '110', question: 'ما هي الألوان الأكثر شهرة للبشت (المشلح) في المناسبات الرسمية؟', answer: 'الأسود، البني، والسكري', category: 'تراث' },
  { id: '111', question: 'ما هي القناة السعودية المخصصة لنقل الصلاة من المسجد الحرام 24 ساعة؟', answer: 'قناة القرآن الكريم', category: 'دين' },
  { id: '112', question: 'ما هي القناة السعودية المخصصة لنقل الصلاة من المسجد النبوي 24 ساعة؟', answer: 'قناة السنة النبوية', category: 'دين' },
  { id: '113', question: 'ماذا تُسمى المسابقة التراثية التي تعتمد على الجري والسباق بين الإبل؟', answer: 'سباق الهجن', category: 'تراث' },
  { id: '114', question: 'هل توحيد المملكة العربية السعودية تم بالحرب فقط أم بالحكمة والعدل أيضاً؟', answer: 'بالحكمة والعدل والشجاعة', category: 'تاريخ' },
  { id: '115', question: 'ما هي الكلمة التي تعني "الوفاء والطاعة" ونقدمها لملكنا وولي عهده؟', answer: 'البيعة', category: 'وطني' },
  { id: '116', question: 'ما هو أغلى شيء نملكه ونفديه بأرواحنا بعد ديننا الإسلامي؟', answer: 'الوطن', category: 'وطني' },
  { id: '117', question: 'ماذا يُسمى الفن المعماري القديم لبيوت جدة (النوافذ الخشبية البارزة)؟', answer: 'الرواشين', category: 'تراث' },
  { id: '118', question: 'ما هي الأداة التي نستخدمها في تزيين الشوارع والسيارات في اليوم الوطني؟', answer: 'العلم السعودي والإضاءات الخضراء', category: 'وطني' },
  { id: '119', question: 'ماذا يرتدي بعض الأطفال الذكور في احتفالات اليوم الوطني؟', answer: 'الزي العسكري أو الثوب التراثي', category: 'وطني' },
  { id: '120', question: 'ماذا ترتدي بعض الفتيات في اليوم الوطني كنوع من التراث السعودي؟', answer: 'الفساتين الخضراء أو النشل التراثي', category: 'وطني' },
  { id: '121', question: 'ما هو الرمز التراثي الذي نستخدمه لتبخير الضيوف بالعود في المناسبات؟', answer: 'المبخرة', category: 'تراث' },
  { id: '122', question: 'ما هي المدينة السعودية التي تُلقب بـ "عاصمة القرار" لأنها العاصمة؟', answer: 'مدينة الرياض', category: 'جغرافيا' },
  { id: '123', question: 'ما هو اسم المركز التاريخي الذي يوجد فيه قصر الملك عبدالعزيز في الرياض؟', answer: 'مركز الملك عبدالعزيز التاريخي (المربع)', category: 'تراث' },
  { id: '124', question: 'ماذا يُسمى الميدان الذي تُرفع فيه أكبر سارية علم في مدينة جدة؟', answer: 'ميدان طارق عبدالحكيم', category: 'معالم' },
  { id: '125', question: 'ما هي الكلمة التي يقولها المضيف لضيفه عند صب القهوة ترحيباً به؟', answer: 'سْم (أو تفضل / حياك الله)', category: 'تراث' },
  { id: '126', question: 'ما هو الحيوان المفترس الذي كان يعيش قديماً في جزيرة العرب وأصبح نادراً اليوم؟', answer: 'النمر العربي', category: 'تراث' },
  { id: '127', question: 'ما هو المشروع السياحي الفاخر الذي يُبنى على جزر البحر الأحمر في السعودية؟', answer: 'مشروع البحر الأحمر', category: 'رؤية' },
  { id: '128', question: 'هل المرأة السعودية مسموح لها بالعمل في جميع المجالات اليوم؟', answer: 'نعم', category: 'مجتمع' },
  { id: '129', question: 'هل يوجد في السعودية بحيرات أو أنهار طبيعية جارية طوال العام؟', answer: 'لا', category: 'جغرافيا' },
  { id: '130', question: 'ما هي المصدر الرئيسي لتحلية مياه الشرب في السعودية؟', answer: 'تحلية مياه البحر', category: 'اقتصاد' },
  { id: '131', question: 'ما هي المهنة التراثية القديمة لأهل الخليج والسعودية قبل اكتشاف النفط؟', answer: 'الغوص للبحث عن اللؤلؤ والتجارة', category: 'تراث' },
  { id: '132', question: 'ماذا يُسمى اللباس الصيفي الأبيض الذي يلبسه الرجل السعودي غالباً؟', answer: 'الثوب الأبيض', category: 'تراث' },
  { id: '133', question: 'ماذا يُسمى اللباس الشتوي الملون (الغامق) الذي يلبسه الرجل السعودي؟', answer: 'الثوب الشتوي (أو الملون)', category: 'تراث' },
  { id: '134', question: 'ما هو نوع الخبز التراثي الرقيق جداً والمشهور في السعودية؟', answer: 'خبز القرصان (أو الرقاق)', category: 'تراث' },
  { id: '135', question: 'ما هي المدينة التي وُلد فيها النبي محمد صلى الله عليه وسلم وتوجد في السعودية؟', answer: 'مكة المكرمة', category: 'دين' },
  { id: '136', question: 'ما هي المدينة التي هاجر إليها النبي محمد صلى الله عليه وسلم وتوجد في السعودية؟', answer: 'المدينة المنورة', category: 'دين' },
  { id: '137', question: 'ما هو اسم البئر المباركة الموجودة في المسجد الحرام بمكة؟', answer: 'بئر زمزم', category: 'دين' },
  { id: '138', question: 'ماذا يُسمى الثوب الأبيض الذي يلبسه المسلمون عند الحج والعمرة؟', answer: 'الإحرام', category: 'دين' },
  { id: '139', question: 'ما هي الزهرة التي تُزرع في أبها وتتزين بها رؤوس الرجال في الجنوب (عصابة الرأس)؟', answer: 'الورد العسيري (أو الشيح والريحان)', category: 'تراث' },
  { id: '140', question: 'ماذا يُسمى النقش التراثي الملون الذي تُزين به النساء جدران المنازل في عسير؟', answer: 'القط العسيري', category: 'تراث' },
  { id: '141', question: 'ما هو الشعار الذي يُطبع على العملات الورقية السعودية الحديثة؟', answer: 'شعار المملكة (السيفان والنخلة) وصورة الملك', category: 'اقتصاد' },
  { id: '142', question: 'ما هي الرياضة التي كان العرب يمارسونها باستخدام القوس والنشاب قديماً؟', answer: 'الرماية', category: 'تراث' },
  { id: '143', question: 'ما هي الهيئة المسؤولة عن تنظيم الحفلات والألعاب النارية في اليوم الوطني؟', answer: 'الهيئة العامة للترفيه', category: 'وطني' },
  { id: '144', question: 'هل تحتفل سفارات المملكة العربية السعودية في الخارج باليوم الوطني؟', answer: 'نعم', category: 'وطني' },
  { id: '145', question: 'ماذا تُسمى المجوهرات والحلي التراثية التي تلبسها العروس السعودية قديماً؟', answer: 'الذهب (أو الهامة والمرتعشة)', category: 'تراث' },
  { id: '146', question: 'ماذا نستخدم لتزيين أيدي الفتيات بالنقوش الجميلة في المناسبات الوطنية؟', answer: 'الحناء', category: 'تراث' },
  { id: '147', question: 'ما هو المشروب البارد المشهور قديماً والمصنوع من حليب الإبل أو الأغنام؟', answer: 'اللبن', category: 'تراث' },
  { id: '148', question: 'ما هي الأكلة الجنوبية الشهيرة المصنوعة من العجين والمرق؟', answer: 'العصيدة (أو العريكة)', category: 'تراث' },
  { id: '149', question: 'من هو أول من أطلق اسم "السعودية" على مواطني هذه البلاد؟', answer: 'الملك عبدالعزيز', category: 'تاريخ' },
  { id: '150', question: 'ما هي الدعوة التي نختم بها دائماً حديثنا عن الوطن؟', answer: 'حفظ الله الوطن وأدام عزه', category: 'وطني' }
];

const MAX_ITEMS = 2000;
const MAX_QUESTIONS = 150;

export function App() {
  const [isNationalMode, setIsNationalMode] = useState(() => {
    const saved = localStorage.getItem('maxman_wheel_mode');
    return saved ? JSON.parse(saved) : false;
  });

  const [config, setConfig] = useState<WheelConfig>(() => {
    const saved = localStorage.getItem('national_wheel_config');
    return saved ? JSON.parse(saved) : { 
      spinDuration: 5, 
      soundEnabled: true, 
      removeWinner: true, 
      confettiEnabled: true,
      questionTimer: 30,
      theme: 'national'
    };
  });

  const [normalItems, setNormalItems] = useState<WheelItem[]>(() => {
    const saved = localStorage.getItem('maxman_wheel_items');
    return saved ? JSON.parse(saved) : [];
  });

  const [numbersItems, setNumbersItems] = useState<WheelItem[]>(() => {
    const saved = localStorage.getItem('national_wheel_numbers');
    return saved ? JSON.parse(saved) : [];
  });

  const [questions, setQuestions] = useState<QuestionWithAnswer[]>(() => {
    const saved = localStorage.getItem('national_wheel_questions');
    return saved ? JSON.parse(saved) : DEFAULT_QUESTIONS.slice(0, 50);
  });

  const [questionCount, setQuestionCount] = useState<number>(() => {
    const saved = localStorage.getItem('national_wheel_question_count');
    return saved ? parseInt(saved) : 50;
  });

  const [history, setHistory] = useState<WinnerRecord[]>(() => {
    const saved = localStorage.getItem('national_wheel_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeWheel, setActiveWheel] = useState<'numbers' | 'questions'>('numbers');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<{ item: WheelItem | QuestionWithAnswer; index: number; wheelType: 'numbers' | 'questions' } | null>(null);
  const [showingQuestion, setShowingQuestion] = useState<{ question: QuestionWithAnswer; showAnswer: boolean } | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [newItemText, setNewItemText] = useState('');
  const [sequentialNumber, setSequentialNumber] = useState('');
  const [currentRotation, setCurrentRotation] = useState(0);
  const [showNationalAnimation, setShowNationalAnimation] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => { 
    soundManager.setEnabled(config.soundEnabled);
    if (isNationalMode) {
      setShowNationalAnimation(true);
      setTimeout(() => setShowNationalAnimation(false), 3000);
    }
  }, [config.soundEnabled, isNationalMode]);

  useEffect(() => { localStorage.setItem('national_wheel_config', JSON.stringify(config)); }, [config]);
  useEffect(() => { localStorage.setItem('national_wheel_numbers', JSON.stringify(numbersItems)); }, [numbersItems]);
  useEffect(() => { localStorage.setItem('national_wheel_questions', JSON.stringify(questions)); }, [questions]);
  useEffect(() => { localStorage.setItem('national_wheel_history', JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem('maxman_wheel_mode', JSON.stringify(isNationalMode)); }, [isNationalMode]);
  useEffect(() => { localStorage.setItem('maxman_wheel_items', JSON.stringify(normalItems)); }, [normalItems]);
  useEffect(() => { localStorage.setItem('national_wheel_question_count', String(questionCount)); }, [questionCount]);

  useEffect(() => {
    if (showingQuestion && countdown > 0) {
      countdownRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && showingQuestion) {
      setShowingQuestion(prev => prev ? { ...prev, showAnswer: true } : null);
    }
    return () => { if (countdownRef.current) clearTimeout(countdownRef.current); };
  }, [showingQuestion, countdown]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, width, height);

    let items: WheelItem[];
    if (!isNationalMode) {
      items = normalItems;
    } else {
      items = activeWheel === 'numbers' ? numbersItems : questions.map(q => ({ id: q.id, text: q.question, enabled: true }));
    }

    if (items.length === 0) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.fillStyle = isNationalMode ? '#047857' : '#404040';
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = isNationalMode ? '#10b981' : '#737373';
      ctx.stroke();
      ctx.fillStyle = isNationalMode ? '#6ee7b7' : '#a3a3a3';
      ctx.font = 'bold 16px Cairo, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(isNationalMode ? (activeWheel === 'numbers' ? 'أضف أرقام من الأسفل' : 'أضف أسئلة من الأسفل') : 'أضف عناصر من الأسفل', centerX, centerY);
      return;
    }

    const total = items.length;
    const arcSize = (2 * Math.PI) / total;

    for (let i = 0; i < total; i++) {
      const startAngle = currentRotation + i * arcSize;
      const endAngle = startAngle + arcSize;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();

      const colors = isNationalMode 
        ? ['#059669', '#ffffff', '#047857', '#10b981', '#065f46', '#34d399']
        : ['#9ca3af', '#d1d5db', '#6b7280', '#a3a3a3', '#525252', '#858585'];
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();

      ctx.lineWidth = 1;
      ctx.strokeStyle = isNationalMode ? '#064e3b' : '#262626';
      ctx.stroke();

      if (total <= 50) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(startAngle + arcSize / 2);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = i % 2 === 0 ? (isNationalMode ? '#ffffff' : '#1f2937') : (isNationalMode ? '#064e3b' : '#4b5563');
        
        const fontSize = total > 30 ? 9 : total > 20 ? 10 : 11;
        ctx.font = `bold ${fontSize}px Cairo, sans-serif`;
        
        let text = items[i].text;
        if (text.length > 20) text = text.substring(0, 18) + '..';
        
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 3;
        ctx.fillText(text, radius - 20, 0);
        ctx.restore();
      }
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 6;
    ctx.strokeStyle = isNationalMode ? '#10b981' : '#737373';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(centerX, centerY, 35, 0, 2 * Math.PI);
    ctx.fillStyle = isNationalMode ? '#064e3b' : '#262626';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = isNationalMode ? '#34d399' : '#9ca3af';
    ctx.stroke();

  }, [normalItems, numbersItems, questions, activeWheel, currentRotation, isNationalMode]);

  const addNormalItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    if (normalItems.length >= MAX_ITEMS) {
      alert(`الحد الأقصى هو ${MAX_ITEMS} عنصر`);
      return;
    }
    setNormalItems(prev => [{ id: Math.random().toString(36).substring(2, 9), text: newItemText.trim(), enabled: true }, ...prev]);
    setNewItemText('');
  };

  const addNumberItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    if (numbersItems.length >= MAX_ITEMS) {
      alert(`الحد الأقصى هو ${MAX_ITEMS} عنصر`);
      return;
    }
    setNumbersItems(prev => [{ id: Math.random().toString(36).substring(2, 9), text: newItemText.trim(), enabled: true }, ...prev]);
    setNewItemText('');
  };

  const addSequentialNumbers = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(sequentialNumber);
    if (!num || num <= 0) {
      alert('الرجاء إدخال رقم صحيح أكبر من 0');
      return;
    }
    if (numbersItems.length + num > MAX_ITEMS) {
      alert(`الحد الأقصى هو ${MAX_ITEMS} عنصر. لديك ${numbersItems.length} عنصر حالياً.`);
      return;
    }
    const newItems = Array.from({ length: num }, (_, i) => ({
      id: Math.random().toString(36).substring(2, 9),
      text: `رقم ${i + 1}`,
      enabled: true
    }));
    setNumbersItems(prev => [...newItems, ...prev]);
    setSequentialNumber('');
  };

  const deleteNormalItem = (id: string) => setNormalItems(prev => prev.filter(item => item.id !== id));
  const deleteNumberItem = (id: string) => setNumbersItems(prev => prev.filter(item => item.id !== id));
  const deleteQuestion = (id: string) => setQuestions(prev => prev.filter(q => q.id !== id));
  const clearNormalItems = () => { if (confirm('حذف جميع العناصر؟')) setNormalItems([]); };
  const clearNumbers = () => { if (confirm('حذف جميع الأرقام؟')) setNumbersItems([]); };
  
  const restoreQuestions = () => {
    const countToRestore = Math.min(questionCount, MAX_QUESTIONS);
    if (confirm(`استعادة ${countToRestore} سؤال من الأسئلة الأصلية؟`)) {
      setQuestions(DEFAULT_QUESTIONS.slice(0, countToRestore));
    }
  };

  const spin = () => {
    let items: (WheelItem | QuestionWithAnswer)[];
    let wheelType: 'numbers' | 'questions';
    
    if (!isNationalMode) {
      items = normalItems;
      wheelType = 'numbers';
    } else {
      items = activeWheel === 'numbers' ? numbersItems : questions;
      wheelType = activeWheel;
    }
    
    if (isSpinning || items.length === 0) return;
    setIsSpinning(true);
    
    const total = items.length;
    const winningIndex = Math.floor(Math.random() * total);
    const arcSize = (2 * Math.PI) / total;
    
    const fullSpins = (5 + Math.floor(Math.random() * 5)) * 2 * Math.PI;
    const targetRotation = currentRotation + fullSpins + (-Math.PI/2 - currentRotation % (2 * Math.PI)) - (winningIndex * arcSize + arcSize / 2);
    
    const duration = config.spinDuration * 1000;
    const startTime = performance.now();
    const startRotation = currentRotation;
    let lastTickIndex = -1;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const newRotation = startRotation + (targetRotation - startRotation) * easeOut;
      setCurrentRotation(newRotation);

      if (config.soundEnabled && progress < 1) {
        const currentIndex = Math.floor(((newRotation + Math.PI / 2) % (2 * Math.PI)) / arcSize) % total;
        if (currentIndex !== lastTickIndex) {
          soundManager.playTick();
          lastTickIndex = currentIndex;
        }
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const winnerItem = items[winningIndex];
        
        if (!isNationalMode) {
          setNormalItems(prev => prev.filter((_, i) => i !== winningIndex));
        } else if (activeWheel === 'numbers') {
          setNumbersItems(prev => prev.filter((_, i) => i !== winningIndex));
        } else {
          setQuestions(prev => prev.filter((_, i) => i !== winningIndex));
        }
        
        setWinner({ item: winnerItem, index: winningIndex, wheelType });
        
        if (config.confettiEnabled) {
          const duration = 2000;
          const end = Date.now() + duration;
          const interval = setInterval(() => {
            if (Date.now() > end) return clearInterval(interval);
            confetti({ particleCount: 20, origin: { x: Math.random(), y: Math.random() - 0.2 }, colors: isNationalMode ? ['#059669', '#ffffff', '#fbbf24'] : ['#9ca3af', '#d1d5db', '#6b7280'] });
          }, 250);
        }
        
        if (config.soundEnabled) soundManager.playWin();
        
        setHistory(prev => [{
          id: Math.random().toString(36).substring(2, 9),
          itemText: (winnerItem as WheelItem).text || (winnerItem as QuestionWithAnswer).question,
          timestamp: new Date().toLocaleTimeString('ar-SA'),
          index: winningIndex,
          wheelType
        }, ...prev]);
        
        if (wheelType === 'questions' && isNationalMode) {
          setShowingQuestion({ question: winnerItem as QuestionWithAnswer, showAnswer: false });
          setCountdown(config.questionTimer);
        }
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const quickAddNumbers = (count: number) => {
    if (numbersItems.length + count > MAX_ITEMS) {
      alert(`الحد الأقصى هو ${MAX_ITEMS} عنصر`);
      return;
    }
    setNumbersItems(prev => [...Array.from({ length: count }, (_, i) => ({ 
      id: Math.random().toString(36).substring(2, 9), 
      text: `رقم ${i + 1}`, 
      enabled: true 
    })), ...prev]);
  };

  const closeWinner = () => {
    setWinner(null);
    setShowingQuestion(null);
  };

  const toggleMode = () => {
    setIsNationalMode(!isNationalMode);
    setIsMenuOpen(false);
  };

  const currentItemsCount = !isNationalMode ? normalItems.length : (activeWheel === 'numbers' ? numbersItems.length : questions.length);

  return (
    <div className={`min-h-screen flex flex-col relative overflow-hidden transition-colors duration-500 ${
      isNationalMode 
        ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100' 
        : 'bg-gradient-to-br from-stone-100 via-neutral-100 to-stone-200'
    }`}>
      {isNationalMode && (
        <>
          <div className="absolute top-0 left-0 w-full overflow-hidden pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="absolute animate-bounce" style={{ 
                left: `${i * 12.5}%`, 
                top: '0',
                animationDelay: `${i * 0.2}s`,
                animationDuration: '3s'
              }}>
                <Flag className="w-12 h-12 text-emerald-600 opacity-60" />
              </div>
            ))}
          </div>
          
          <div className="absolute top-20 right-10 opacity-15 text-[180px] font-black text-emerald-600 select-none pointer-events-none">96</div>
          
          <div className="absolute bottom-0 left-10 opacity-20 pointer-events-none">
            <div className="text-[100px]">🌴</div>
          </div>
          <div className="absolute bottom-0 right-10 opacity-20 pointer-events-none">
            <div className="text-[100px]">🌴</div>
          </div>
          
          {showNationalAnimation && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(30)].map((_, i) => (
                <div key={i} className="absolute animate-ping" style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`
                }}>
                  <Sparkles className="w-6 h-6 text-emerald-500" />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <header className={`w-full backdrop-blur-xl sticky top-0 z-40 px-4 py-3 border-b transition-colors ${
        isNationalMode 
          ? 'bg-emerald-100/80 border-emerald-200' 
          : 'bg-white/80 border-stone-200'
      }`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all ${
              isNationalMode 
                ? 'bg-gradient-to-tr from-emerald-500 to-emerald-400 shadow-emerald-500/30 flag-animation' 
                : 'bg-gradient-to-tr from-stone-400 to-stone-300'
            }`}>
              {isNationalMode ? <Flag className="w-6 h-6 text-white" /> : <Sparkles className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h1 className={`text-xl sm:text-2xl font-black ${isNationalMode ? 'text-emerald-800' : 'text-stone-800'}`}>
                {isNationalMode ? 'عجلة الحظ الوطنية' : 'Maxman Wheel'}
              </h1>
              <p className={`text-[11px] font-medium ${isNationalMode ? 'text-emerald-600' : 'text-stone-500'}`}>
                {isNationalMode ? 'اليوم الوطني السعودي 96 - 150 سؤال' : 'عجلة الحظ العصرية'}
              </p>
            </div>
          </div>
          
          {isNationalMode && (
            <div className="flex items-center gap-1 bg-white/60 rounded-xl p-1 border border-emerald-200">
              <button onClick={() => { setActiveWheel('numbers'); setCurrentRotation(0); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  activeWheel === 'numbers' 
                    ? 'bg-emerald-500 text-white' 
                    : 'text-stone-500 hover:text-emerald-600'
                }`}>
                <Hash className="w-3 h-3" /> <span className="hidden sm:inline">الأرقام</span>
              </button>
              <button onClick={() => { setActiveWheel('questions'); setCurrentRotation(0); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  activeWheel === 'questions' 
                    ? 'bg-emerald-500 text-white' 
                    : 'text-stone-500 hover:text-emerald-600'
                }`}>
                <MessageSquare className="w-3 h-3" /> <span className="hidden sm:inline">الأسئلة</span>
              </button>
            </div>
          )}
          
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2.5 rounded-xl transition-all border ${
              isNationalMode 
                ? 'bg-emerald-200 hover:bg-emerald-300 text-emerald-800 border-emerald-300' 
                : 'bg-stone-200 hover:bg-stone-300 text-stone-700 border-stone-300'
            }`}>
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className={`fixed left-4 top-16 z-50 w-60 rounded-2xl shadow-2xl p-3 animate-in fade-in zoom-in-95 border ${
          isNationalMode 
            ? 'bg-emerald-100 border-emerald-200' 
            : 'bg-white border-stone-200'
        }`}>
          <div className={`px-3 py-2 mb-2 rounded-xl border ${
            isNationalMode 
              ? 'bg-gradient-to-r from-emerald-200 to-emerald-100 border-emerald-300' 
              : 'bg-gradient-to-r from-stone-200 to-stone-100 border-stone-300'
          }`}>
            <p className={`font-black text-sm flex items-center gap-2 ${isNationalMode ? 'text-emerald-800' : 'text-stone-800'}`}>
              {isNationalMode ? <Flag className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              {isNationalMode ? 'عجلة الحظ الوطنية' : 'Maxman Wheel'}
            </p>
            <p className={`text-[10px] mt-0.5 ${isNationalMode ? 'text-emerald-600' : 'text-stone-500'}`}>
              {isNationalMode ? 'اليوم الوطني السعودي 96' : 'عجلة الحظ العصرية'}
            </p>
          </div>
          
          <button onClick={toggleMode}
            className={`w-full text-right px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${
              isNationalMode ? 'hover:bg-emerald-200 text-emerald-800' : 'hover:bg-stone-100 text-stone-700'
            }`}>
            {isNationalMode ? <Home className="w-4 h-4" /> : <Flag className="w-4 h-4" />}
            <span>{isNationalMode ? 'الوضع العادي' : 'وضع اليوم الوطني'}</span>
          </button>
          
          <button onClick={() => { setShowSettings(true); setIsMenuOpen(false); }}
            className={`w-full text-right px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${
              isNationalMode ? 'hover:bg-emerald-200 text-emerald-800' : 'hover:bg-stone-100 text-stone-700'
            }`}>
            <Settings className={`w-4 h-4 ${isNationalMode ? 'text-emerald-600' : 'text-stone-500'}`} /><span>الإعدادات</span>
          </button>
          <button onClick={() => { setShowHistory(true); setIsMenuOpen(false); }}
            className={`w-full text-right px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${
              isNationalMode ? 'hover:bg-emerald-200 text-emerald-800' : 'hover:bg-stone-100 text-stone-700'
            }`}>
            <History className={`w-4 h-4 ${isNationalMode ? 'text-emerald-600' : 'text-stone-500'}`} /><span>السجل ({history.length})</span>
          </button>
          <button onClick={() => { setConfig(p => ({ ...p, soundEnabled: !p.soundEnabled })); }}
            className={`w-full text-right px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-3 ${
              isNationalMode ? 'hover:bg-emerald-200 text-emerald-800' : 'hover:bg-stone-100 text-stone-700'
            }`}>
            {config.soundEnabled ? <Volume2 className={`w-4 h-4 ${isNationalMode ? 'text-emerald-600' : 'text-stone-500'}`} /> : <VolumeX className="w-4 h-4 text-stone-400" />}
            <span>{config.soundEnabled ? 'الصوت مفعل' : 'الصوت معطل'}</span>
          </button>
        </div>
      )}

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 flex flex-col items-center justify-center">
        <div className={`mb-4 flex items-center gap-2 px-4 py-2 rounded-full border ${
          isNationalMode 
            ? 'bg-emerald-100/80 border-emerald-200' 
            : 'bg-white/80 border-stone-200'
        }`}>
          {!isNationalMode ? (
            <>
              <Sparkles className="w-4 h-4 text-stone-500" />
              <span className="text-sm font-bold text-stone-700">عجلة العناصر ({normalItems.length} عنصر)</span>
            </>
          ) : activeWheel === 'numbers' ? (
            <>
              <Hash className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-700">عجلة الأرقام ({numbersItems.length} عنصر)</span>
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-bold text-emerald-700">عجلة الأسئلة ({questions.length} سؤال)</span>
            </>
          )}
        </div>

        <div className="text-center mb-6">
          <h2 className={`text-3xl sm:text-4xl font-black bg-gradient-to-r bg-clip-text text-transparent ${
            isNationalMode 
              ? 'from-emerald-600 via-emerald-500 to-emerald-600' 
              : 'from-stone-600 via-stone-500 to-stone-600'
          }`}>
            {isNationalMode ? 'عجلة الحظ الوطنية' : 'Maxman Wheel'}
          </h2>
          <p className={`text-sm mt-2 font-medium ${isNationalMode ? 'text-emerald-600' : 'text-stone-500'}`}>
            {isNationalMode ? 'اليوم الوطني السعودي 96 - أدِر العجلة وفز!' : 'أضف عناصرِك ودر العجلة - سهل وسريع'}
          </p>
        </div>

        <div className="relative mb-8">
          <div className={`w-[300px] h-[300px] sm:w-[420px] sm:h-[420px] rounded-full border-4 shadow-2xl flex items-center justify-center relative overflow-hidden ${
            isNationalMode 
              ? 'bg-gradient-to-br from-emerald-200 to-emerald-300 border-emerald-400 shadow-emerald-500/20' 
              : 'bg-gradient-to-br from-stone-200 to-stone-300 border-stone-400 shadow-stone-500/20'
          }`}>
            <canvas ref={canvasRef} width={420} height={420} className="w-full h-full" />
            
            <button onClick={spin} disabled={isSpinning || currentItemsCount === 0}
              className={`absolute w-20 h-20 rounded-full shadow-xl flex items-center justify-center border-4 transition-all active:scale-95 disabled:opacity-50 ${
                isNationalMode 
                  ? 'bg-gradient-to-tr from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 border-emerald-700' 
                  : 'bg-gradient-to-tr from-stone-500 to-stone-400 hover:from-stone-400 hover:to-stone-300 border-stone-700'
              }`}>
              {isSpinning ? <Sparkles className="w-7 h-7 animate-spin text-white" /> : <Play className="w-7 h-7 fill-white" />}
            </button>
          </div>
          
          <div className={`absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent z-10 drop-shadow-lg ${
            isNationalMode ? 'border-t-emerald-500' : 'border-t-stone-500'
          }`}></div>
        </div>

        <button onClick={spin} disabled={isSpinning || currentItemsCount === 0}
          className={`px-8 py-3.5 rounded-2xl font-black text-lg shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2 mb-8 ${
            isNationalMode 
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 shadow-emerald-500/30 text-white' 
              : 'bg-gradient-to-r from-stone-600 to-stone-500 hover:from-stone-500 hover:to-stone-400 shadow-stone-500/30 text-white'
          }`}>
          <Sparkles className="w-5 h-5" />
          <span>{isSpinning ? 'جاري الدوران...' : 'دوّر العجلة'}</span>
        </button>

        <div className={`w-full max-w-2xl rounded-2xl p-4 border ${
          isNationalMode 
            ? 'bg-emerald-100/60 border-emerald-200' 
            : 'bg-white/60 border-stone-200'
        }`}>
          {!isNationalMode ? (
            <>
              <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isNationalMode ? 'text-emerald-700' : 'text-stone-700'}`}>
                <Plus className="w-4 h-4" /> أضف عناصرِك (الحد الأقصى: {MAX_ITEMS})
              </h3>
              
              <form onSubmit={addNormalItem} className="flex gap-2 mb-3">
                <input type="text" value={newItemText} onChange={e => setNewItemText(e.target.value)}
                  placeholder="اكتب أي عنصر (أرقام، أسماء، كلمات)..." 
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none ${
                    isNationalMode 
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 focus:border-emerald-400' 
                      : 'bg-stone-50 border border-stone-200 text-stone-900 focus:border-stone-400'
                  }`} />
                <button type="submit" className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-1 ${
                  isNationalMode 
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-white' 
                    : 'bg-stone-500 hover:bg-stone-400 text-white'
                }`}>
                  <Plus className="w-4 h-4" /> إضافة
                </button>
              </form>
              
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium ${isNationalMode ? 'text-emerald-600' : 'text-stone-500'}`}>{normalItems.length} / {MAX_ITEMS} عنصر</span>
                {normalItems.length > 0 && (
                  <button onClick={clearNormalItems} className={`text-xs font-semibold flex items-center gap-1 ${isNationalMode ? 'text-red-500 hover:text-red-400' : 'text-red-500 hover:text-red-400'}`}>
                    <Trash2 className="w-3 h-3" /> حذف الكل
                  </button>
                )}
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                {normalItems.length === 0 ? (
                  <p className={`text-xs text-center py-4 ${isNationalMode ? 'text-emerald-500' : 'text-stone-500'}`}>لا توجد عناصر مضافة</p>
                ) : (
                  normalItems.slice(0, 10).map((item, idx) => (
                    <div key={item.id} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                      isNationalMode 
                        ? 'bg-emerald-50/60 border-emerald-200' 
                        : 'bg-stone-50/60 border-stone-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${isNationalMode ? 'bg-emerald-200 text-emerald-700' : 'bg-stone-200 text-stone-700'}`}>{idx + 1}</span>
                        <span className={`text-xs truncate max-w-[150px] ${isNationalMode ? 'text-emerald-800' : 'text-stone-800'}`}>{item.text}</span>
                      </div>
                      <button onClick={() => deleteNormalItem(item.id)} className={`transition-all ${isNationalMode ? 'text-emerald-500 hover:text-red-500' : 'text-stone-500 hover:text-red-500'}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
                {normalItems.length > 10 && (
                  <p className={`text-xs text-center py-2 ${isNationalMode ? 'text-emerald-500' : 'text-stone-500'}`}>... و{normalItems.length - 10} عناصر أخرى</p>
                )}
              </div>
            </>
          ) : activeWheel === 'numbers' ? (
            <>
              <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isNationalMode ? 'text-emerald-700' : 'text-stone-700'}`}>
                <Hash className="w-4 h-4" /> أضف الأرقام (الحد الأقصى: {MAX_ITEMS})
              </h3>
              
              <form onSubmit={addSequentialNumbers} className="flex gap-2 mb-3">
                <input type="number" value={sequentialNumber} onChange={e => setSequentialNumber(e.target.value)}
                  placeholder="أدخل العدد (مثال: 345 يولد 1-345)" 
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none ${
                    isNationalMode 
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 focus:border-emerald-400' 
                      : 'bg-stone-50 border border-stone-200 text-stone-900 focus:border-stone-400'
                  }`} />
                <button type="submit" className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-1 ${
                  isNationalMode 
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-white' 
                    : 'bg-stone-500 hover:bg-stone-400 text-white'
                }`}>
                  <List className="w-4 h-4" /> توليد متسلسل
                </button>
              </form>
              
              <form onSubmit={addNumberItem} className="flex gap-2 mb-3">
                <input type="text" value={newItemText} onChange={e => setNewItemText(e.target.value)}
                  placeholder="اكتب الرقم أو النص..." 
                  className={`flex-1 px-4 py-2.5 rounded-xl text-sm focus:outline-none ${
                    isNationalMode 
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-900 focus:border-emerald-400' 
                      : 'bg-stone-50 border border-stone-200 text-stone-900 focus:border-stone-400'
                  }`} />
                <button type="submit" className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-1 ${
                  isNationalMode 
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-white' 
                    : 'bg-stone-500 hover:bg-stone-400 text-white'
                }`}>
                  <Plus className="w-4 h-4" /> إضافة
                </button>
              </form>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {[10, 50, 100, 200, 500].map(num => (
                  <button key={num} onClick={() => quickAddNumbers(num)} 
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isNationalMode 
                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700' 
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
                    }`}>
                    +{num}
                  </button>
                ))}
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium ${isNationalMode ? 'text-emerald-600' : 'text-stone-500'}`}>{numbersItems.length} / {MAX_ITEMS} عنصر</span>
                {numbersItems.length > 0 && (
                  <button onClick={clearNumbers} className={`text-xs font-semibold flex items-center gap-1 ${isNationalMode ? 'text-red-500 hover:text-red-400' : 'text-red-500 hover:text-red-400'}`}>
                    <Trash2 className="w-3 h-3" /> حذف الكل
                  </button>
                )}
              </div>
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                {numbersItems.length === 0 ? (
                  <p className={`text-xs text-center py-4 ${isNationalMode ? 'text-emerald-500' : 'text-stone-500'}`}>لا توجد أرقام مضافة</p>
                ) : (
                  numbersItems.slice(0, 10).map((item, idx) => (
                    <div key={item.id} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                      isNationalMode 
                        ? 'bg-emerald-50/60 border-emerald-200' 
                        : 'bg-stone-50/60 border-stone-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${isNationalMode ? 'bg-emerald-200 text-emerald-700' : 'bg-stone-200 text-stone-700'}`}>{idx + 1}</span>
                        <span className={`text-xs truncate max-w-[150px] ${isNationalMode ? 'text-emerald-800' : 'text-stone-800'}`}>{item.text}</span>
                      </div>
                      <button onClick={() => deleteNumberItem(item.id)} className={`transition-all ${isNationalMode ? 'text-emerald-500 hover:text-red-500' : 'text-stone-500 hover:text-red-500'}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
                {numbersItems.length > 10 && (
                  <p className={`text-xs text-center py-2 ${isNationalMode ? 'text-emerald-500' : 'text-stone-500'}`}>... و{numbersItems.length - 10} عناصر أخرى</p>
                )}
              </div>
            </>
          ) : (
            <>
              <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isNationalMode ? 'text-emerald-700' : 'text-stone-700'}`}>
                <MessageSquare className="w-4 h-4" /> أسئلة المسابقة الوطنية (150 سؤال)
              </h3>
              
              <div className={`mb-4 p-3 rounded-xl border ${isNationalMode ? 'bg-emerald-50/60 border-emerald-200' : 'bg-stone-50/60 border-stone-200'}`}>
                <label className={`text-xs font-bold mb-2 block ${isNationalMode ? 'text-emerald-700' : 'text-stone-700'}`}>
                  اختر عدد الأسئلة (الحد الأقصى: {MAX_QUESTIONS}):
                </label>
                <div className="flex flex-wrap gap-2">
                  {[10, 20, 30, 40, 50, 75, 100, 125, 150].map(count => (
                    <button
                      key={count}
                      onClick={() => {
                        setQuestionCount(count);
                        setQuestions(DEFAULT_QUESTIONS.slice(0, count));
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        questionCount === count
                          ? 'bg-emerald-500 text-white'
                          : isNationalMode 
                            ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700' 
                            : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
                <p className={`text-[10px] mt-2 ${isNationalMode ? 'text-emerald-600' : 'text-stone-500'}`}>
                  حالياً: {questionCount} سؤال من {MAX_QUESTIONS} سؤال متاح
                </p>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-medium ${isNationalMode ? 'text-emerald-600' : 'text-stone-500'}`}>{questions.length} / {questionCount} سؤال متبقي</span>
                <button onClick={restoreQuestions} className={`text-xs font-semibold flex items-center gap-1 ${isNationalMode ? 'text-emerald-600 hover:text-emerald-500' : 'text-stone-600 hover:text-stone-500'}`}>
                  <RotateCcw className="w-3 h-3" /> استعادة الأسئلة
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                {questions.length === 0 ? (
                  <p className={`text-xs text-center py-4 ${isNationalMode ? 'text-emerald-500' : 'text-stone-500'}`}>تم استخدام جميع الأسئلة - اضغط استعادة الأسئلة</p>
                ) : (
                  questions.slice(0, 10).map((q, idx) => (
                    <div key={q.id} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${
                      isNationalMode 
                        ? 'bg-emerald-50/60 border-emerald-200' 
                        : 'bg-stone-50/60 border-stone-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${isNationalMode ? 'bg-emerald-200 text-emerald-700' : 'bg-stone-200 text-stone-700'}`}>{idx + 1}</span>
                        <span className={`text-xs truncate max-w-[200px] ${isNationalMode ? 'text-emerald-800' : 'text-stone-800'}`}>{q.question}</span>
                      </div>
                      <button onClick={() => deleteQuestion(q.id)} className={`transition-all ${isNationalMode ? 'text-emerald-500 hover:text-red-500' : 'text-stone-500 hover:text-red-500'}`}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
                {questions.length > 10 && (
                  <p className={`text-xs text-center py-2 ${isNationalMode ? 'text-emerald-500' : 'text-stone-500'}`}>... و{questions.length - 10} أسئلة أخرى</p>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <footer className={`w-full py-4 text-center text-xs border-t ${
        isNationalMode 
          ? 'text-emerald-600 border-emerald-200 bg-emerald-100/60' 
          : 'text-stone-500 border-stone-200 bg-white/60'
      }`}>
        <p>{isNationalMode ? '🇸🇦 عجلة الحظ الوطنية - اليوم الوطني السعودي 96 - 150 سؤال 🇸🇦' : 'Maxman Wheel © 2026'}</p>
      </footer>

      {winner && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
          <div className={`bg-gradient-to-br border rounded-3xl shadow-2xl overflow-hidden p-6 text-center relative w-full max-w-sm ${
            isNationalMode 
              ? 'from-emerald-100 to-emerald-200 border-emerald-300' 
              : 'from-stone-100 to-stone-200 border-stone-300'
          }`}>
            <button onClick={closeWinner} className={`absolute top-4 left-4 w-8 h-8 rounded-xl flex items-center justify-center ${
              isNationalMode ? 'bg-emerald-200 hover:bg-emerald-300 text-emerald-700' : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
            }`}>
              <X className="w-4 h-4" />
            </button>
            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4 ${
              isNationalMode 
                ? 'bg-gradient-to-tr from-emerald-500 to-emerald-400' 
                : 'bg-gradient-to-tr from-stone-500 to-stone-400'
            }`}>
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h2 className={`text-lg font-black mb-1 ${isNationalMode ? 'text-emerald-800' : 'text-stone-800'}`}>
              {winner.wheelType === 'numbers' || !isNationalMode ? 'العنصر الفائز!' : 'السؤال المختار!'}
            </h2>
            <div className={`my-4 p-4 rounded-xl border ${isNationalMode ? 'bg-emerald-50/60 border-emerald-300' : 'bg-stone-50/60 border-stone-300'}`}>
              <p className={`text-xl font-bold break-words ${isNationalMode ? 'text-emerald-900' : 'text-stone-900'}`}>
                {winner.wheelType === 'questions' ? (winner.item as QuestionWithAnswer).question : (winner.item as WheelItem).text}
              </p>
              <p className={`text-xs mt-2 ${isNationalMode ? 'text-emerald-600' : 'text-stone-500'}`}>الموقع: #{winner.index + 1}</p>
            </div>
            <button onClick={closeWinner}
              className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-1 ${
                isNationalMode 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white' 
                  : 'bg-gradient-to-r from-stone-600 to-stone-500 hover:from-stone-500 hover:to-stone-400 text-white'
              }`}>
              <Play className="w-4 h-4" /> {winner.wheelType === 'questions' ? 'بدء المؤقت' : 'متابعة'}
            </button>
          </div>
        </div>
      )}

      {showingQuestion && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
          <div className={`bg-gradient-to-br border-2 rounded-3xl shadow-2xl overflow-hidden p-8 text-center relative w-full max-w-lg ${
            isNationalMode 
              ? 'from-emerald-100 to-emerald-200 border-emerald-400' 
              : 'from-stone-100 to-stone-200 border-stone-400'
          }`}>
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <Timer className={`w-5 h-5 ${isNationalMode ? 'text-emerald-600' : 'text-stone-600'}`} />
              <span className={`text-sm font-bold ${isNationalMode ? 'text-emerald-700' : 'text-stone-700'}`}>{countdown} ثانية</span>
            </div>
            
            <div className={`w-20 h-20 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-6 ${
              isNationalMode 
                ? 'bg-gradient-to-tr from-emerald-500 to-emerald-400' 
                : 'bg-gradient-to-tr from-stone-500 to-stone-400'
            }`}>
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
            
            <h2 className={`text-2xl font-black mb-2 ${isNationalMode ? 'text-emerald-800' : 'text-stone-800'}`}>سؤال المسابقة</h2>
            <div className={`my-6 p-6 rounded-2xl border ${isNationalMode ? 'bg-emerald-50/60 border-emerald-300' : 'bg-stone-50/60 border-stone-300'}`}>
              <p className={`text-xl font-bold leading-relaxed mb-4 ${isNationalMode ? 'text-emerald-900' : 'text-stone-900'}`}>
                {showingQuestion.question.question}
              </p>
              
              <div className={`mt-6 p-4 rounded-xl border-2 ${
                showingQuestion.showAnswer 
                  ? isNationalMode ? 'bg-emerald-200/60 border-emerald-400' : 'bg-stone-200/60 border-stone-400'
                  : 'border-dashed border-stone-300'
              }`}>
                <p className={`text-sm font-bold mb-2 ${isNationalMode ? 'text-emerald-700' : 'text-stone-700'}`}>
                  {showingQuestion.showAnswer ? '✅ الإجابة الصحيحة:' : '⏳ الإجابة مخفية...'}
                </p>
                <p className={`text-lg font-black ${
                  showingQuestion.showAnswer 
                    ? isNationalMode ? 'text-emerald-800' : 'text-stone-800'
                    : 'text-stone-400 blur-sm select-none'
                }`}>
                  {showingQuestion.question.answer}
                </p>
              </div>
              
              {showingQuestion.question.category && (
                <span className={`inline-block mt-4 px-3 py-1 rounded-full text-xs font-semibold ${
                  isNationalMode ? 'bg-emerald-200 text-emerald-700' : 'bg-stone-200 text-stone-700'
                }`}>
                  {showingQuestion.question.category}
                </span>
              )}
            </div>
            
            <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden mb-4">
              <div className={`h-full transition-all duration-1000 ${
                showingQuestion.showAnswer 
                  ? 'bg-emerald-500' 
                  : isNationalMode ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-stone-500 to-stone-400'
              }`}
                style={{ width: showingQuestion.showAnswer ? '0%' : `${(countdown / config.questionTimer) * 100}%` }}></div>
            </div>
            
            <button onClick={() => { setShowingQuestion(null); }}
              className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                isNationalMode 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white' 
                  : 'bg-gradient-to-r from-stone-600 to-stone-500 hover:from-stone-500 hover:to-stone-400 text-white'
              }`}>
              <CheckCircle className="w-4 h-4" /> {showingQuestion.showAnswer ? 'السؤال التالي' : 'إخفاء'}
            </button>
          </div>
        </div>
      )}

      {showSettings && (
        <div className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 ${
          isNationalMode 
            ? 'bg-emerald-100 border-emerald-200' 
            : 'bg-stone-100 border-stone-200'
        }`}>
          <div className={`border rounded-3xl shadow-2xl overflow-hidden p-6 relative w-full max-w-sm ${
            isNationalMode 
              ? 'bg-emerald-100 border-emerald-200' 
              : 'bg-stone-100 border-stone-200'
          }`}>
            <button onClick={() => setShowSettings(false)} className={`absolute top-4 left-4 w-8 h-8 rounded-xl flex items-center justify-center ${
              isNationalMode ? 'bg-emerald-200 hover:bg-emerald-300 text-emerald-700' : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
            }`}>
              <X className="w-4 h-4" />
            </button>
            <h2 className={`text-lg font-black mb-4 flex items-center gap-2 ${isNationalMode ? 'text-emerald-800' : 'text-stone-800'}`}>
              <Settings className="w-5 h-5" /> الإعدادات
            </h2>
            <div className="space-y-4">
              <label className={`flex items-center justify-between text-sm ${isNationalMode ? 'text-emerald-700' : 'text-stone-700'}`}>
                <span>إزالة الفائز تلقائياً</span>
                <input type="checkbox" checked={config.removeWinner} onChange={e => setConfig(p => ({ ...p, removeWinner: e.target.checked }))}
                  className={`w-4 h-4 rounded border ${isNationalMode ? 'bg-emerald-200 border-emerald-300' : 'bg-stone-200 border-stone-300'}`} disabled />
                <span className="text-xs text-stone-500">(مفعل دائماً)</span>
              </label>
              <label className={`flex items-center justify-between text-sm ${isNationalMode ? 'text-emerald-700' : 'text-stone-700'}`}>
                <span>قصاصات الاحتفال</span>
                <input type="checkbox" checked={config.confettiEnabled} onChange={e => setConfig(p => ({ ...p, confettiEnabled: e.target.checked }))}
                  className={`w-4 h-4 rounded border ${isNationalMode ? 'bg-emerald-200 border-emerald-300' : 'bg-stone-200 border-stone-300'}`} />
              </label>
              <div className={`flex items-center justify-between text-sm ${isNationalMode ? 'text-emerald-700' : 'text-stone-700'}`}>
                <span>مدة دوران العجلة</span>
                <select value={config.spinDuration} onChange={e => setConfig(p => ({ ...p, spinDuration: parseInt(e.target.value) }))}
                  className={`px-3 py-1.5 rounded-lg border text-xs ${isNationalMode ? 'bg-emerald-200 border-emerald-300' : 'bg-stone-200 border-stone-300'}`}>
                  <option value="3">3 ثواني</option>
                  <option value="5">5 ثواني</option>
                  <option value="8">8 ثواني</option>
                  <option value="10">10 ثواني</option>
                </select>
              </div>
              <div className={`flex items-center justify-between text-sm ${isNationalMode ? 'text-emerald-700' : 'text-stone-700'}`}>
                <span>وقت السؤال (ثواني)</span>
                <input type="number" value={config.questionTimer} onChange={e => setConfig(p => ({ ...p, questionTimer: parseInt(e.target.value) || 30 }))}
                  min="5" max="120"
                  className={`w-20 px-3 py-1.5 rounded-lg border text-xs text-center ${isNationalMode ? 'bg-emerald-200 border-emerald-300' : 'bg-stone-200 border-stone-300'}`} />
              </div>
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] w-full max-w-md ${
            isNationalMode 
              ? 'bg-emerald-100 border-emerald-200' 
              : 'bg-stone-100 border-stone-200'
          }`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between ${isNationalMode ? 'border-emerald-200' : 'border-stone-200'}`}>
              <h2 className={`text-lg font-black flex items-center gap-2 ${isNationalMode ? 'text-emerald-800' : 'text-stone-800'}`}>
                <History className="w-5 h-5" /> سجل الفائزين
              </h2>
              <button onClick={() => setShowHistory(false)} className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isNationalMode ? 'bg-emerald-200 hover:bg-emerald-300 text-emerald-700' : 'bg-stone-200 hover:bg-stone-300 text-stone-700'
              }`}>
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-y-auto space-y-2">
              {history.length === 0 ? (
                <p className={`text-center text-sm py-8 ${isNationalMode ? 'text-emerald-600' : 'text-stone-500'}`}>لا يوجد سجل بعد</p>
              ) : (
                history.map((record, idx) => (
                  <div key={record.id} className={`flex items-center justify-between p-3 rounded-xl border ${
                    isNationalMode 
                      ? 'bg-emerald-50/60 border-emerald-200' 
                      : 'bg-stone-50/60 border-stone-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      {record.wheelType === 'numbers' ? <Hash className={`w-4 h-4 ${isNationalMode ? 'text-emerald-600' : 'text-stone-500'}`} /> : <MessageSquare className={`w-4 h-4 ${isNationalMode ? 'text-emerald-600' : 'text-stone-500'}`} />}
                      <div>
                        <p className={`text-sm font-bold ${isNationalMode ? 'text-emerald-800' : 'text-stone-800'}`}>{record.itemText}</p>
                        <p className={`text-[10px] ${isNationalMode ? 'text-emerald-600' : 'text-stone-500'}`}>{record.timestamp}</p>
                      </div>
                    </div>
                    <span className={`text-xs ${isNationalMode ? 'text-emerald-500' : 'text-stone-500'}`}>#{idx + 1}</span>
                  </div>
                ))
              )}
            </div>
            {history.length > 0 && (
              <div className={`px-6 py-4 border-t ${isNationalMode ? 'border-emerald-200' : 'border-stone-200'}`}>
                <button onClick={() => setHistory([])} className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  isNationalMode 
                    ? 'bg-red-500/10 hover:bg-red-500/20 text-red-500' 
                    : 'bg-red-500/10 hover:bg-red-500/20 text-red-500'
                }`}>
                  <Trash2 className="w-4 h-4" /> مسح السجل
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
