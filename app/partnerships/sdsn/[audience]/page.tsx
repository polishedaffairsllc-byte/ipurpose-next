import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PitchAnalytics from './PitchAnalytics';
import PresentationCarousel from './PresentationCarousel';

type PitchConfig = {
  code: string;
  badge: string;
  title: string;
  subtitle: string;
  recipient: string;
  slides: string[];
};

const ghanaSlides = [
  'https://media.canva.com/v2/document-image/hash:381761356/height:335/id:DAHZKIvh2C4/type:B/width:596?brand=BAEcoFJ6npA&csig=AAAAAAAAAAAAAAAAAAAAAAtL2MebSkgu0Kum8GQM4OEvrCIJkxoFPBYzuBWHe2Ow&exp=1793068019&fallback=https%3A%2F%2Fs3.amazonaws.com%2Fdocument-export-us1.canva.com%2Fvh2C4%2FDAHZKIvh2C4%2F1%2Fthumbnail%2F0001.png%3FX-Amz-Algorithm%3DAWS4-HMAC-SHA256%26X-Amz-Credential%3DAKIAQYCGKMUH545XFSWX%252F20261026%252Fus-east-1%252Fs3%252Faws4_request%26X-Amz-Date%3D20261026T103725Z%26X-Amz-Expires%3D57273%26X-Amz-Signature%3D73b7ffdf9fa9d3104a2972da7f2e6af4949d9bdf1b4e934cdbe7f80182d1e1bb%26X-Amz-SignedHeaders%3Dhost%26response-expires%3DTue%252C%252027%2520Oct%25202026%252002%253A31%253A58%2520GMT&osig=AAAAAAAAAAAAAAAAAAAAANXrMrL6OcyoSC-_VBM_QlucmpHtZpcqFOB6mPaLuhTn&page=1&signed=brand%2Cfallback%2Cpage%2Cversion&signer=document-rpc&version=1',
  'https://media.canva.com/v2/document-image/hash:-2030994820/height:335/id:DAHZKIvh2C4/type:B/width:596?brand=BAEcoFJ6npA&csig=AAAAAAAAAAAAAAAAAAAAAJqClBavuX4t7NLOh5mRYW-B4sa30ur_XGJG4kVgCe5B&exp=1793068019&fallback=https%3A%2F%2Fs3.amazonaws.com%2Fdocument-export-us1.canva.com%2Fvh2C4%2FDAHZKIvh2C4%2F1%2Fthumbnail%2F0002.png%3FX-Amz-Algorithm%3DAWS4-HMAC-SHA256%26X-Amz-Credential%3DAKIAQYCGKMUH545XFSWX%252F20261026%252Fus-east-1%252Fs3%252Faws4_request%26X-Amz-Date%3D20261026T052708Z%26X-Amz-Expires%3D75429%26X-Amz-Signature%3D10fd439432d86cc793b1ce92c486bc701108ea01b472f34c8ebd60455ad5ee44%26X-Amz-SignedHeaders%3Dhost%26response-expires%3DTue%252C%252027%2520Oct%25202026%252002%253A24%253A17%2520GMT&osig=AAAAAAAAAAAAAAAAAAAAAPiWCUrz_MhPZbTvFJ8Af1PAK_SkaiT2jEkL9zANAOTI&page=2&signed=brand%2Cfallback%2Cpage%2Cversion&signer=document-rpc&version=1',
  'https://media.canva.com/v2/document-image/hash:-1332323519/height:335/id:DAHZKIvh2C4/type:B/width:596?brand=BAEcoFJ6npA&csig=AAAAAAAAAAAAAAAAAAAAAIyUG0_NoAF-Z6l1d77Ng4CSCr_Dvu8YRI34qgbJiPLE&exp=1793068019&fallback=https%3A%2F%2Fs3.amazonaws.com%2Fdocument-export-us1.canva.com%2Fvh2C4%2FDAHZKIvh2C4%2F1%2Fthumbnail%2F0003.png%3FX-Amz-Algorithm%3DAWS4-HMAC-SHA256%26X-Amz-Credential%3DAKIAQYCGKMUH545XFSWX%252F20261026%252Fus-east-1%252Fs3%252Faws4_request%26X-Amz-Date%3D20261026T184326Z%26X-Amz-Expires%3D26669%26X-Amz-Signature%3D1adfbbafb9c8427c5581b16bcb37a913e669725eee4f26457593f61bc1ae0dfe%26X-Amz-SignedHeaders%3Dhost%26response-expires%3DTue%252C%252027%2520Oct%25202026%252002%253A07%253A55%2520GMT&osig=AAAAAAAAAAAAAAAAAAAAAFsZhPaMZucrOhgRVQml5BuZyssAAs2DR-_c0EpWkmnh&page=3&signed=brand%2Cfallback%2Cpage%2Cversion&signer=document-rpc&version=1',
  'https://media.canva.com/v2/document-image/hash:813619335/height:335/id:DAHZKIvh2C4/type:B/width:596?brand=BAEcoFJ6npA&csig=AAAAAAAAAAAAAAAAAAAAAI_QO8l0kiJGdZCx4FTpm1jMZmllsv4n_j8NqNZXSh0e&exp=1793068019&fallback=https%3A%2F%2Fs3.amazonaws.com%2Fdocument-export-us1.canva.com%2Fvh2C4%2FDAHZKIvh2C4%2F1%2Fthumbnail%2F0004.png%3FX-Amz-Algorithm%3DAWS4-HMAC-SHA256%26X-Amz-Credential%3DAKIAQYCGKMUH545XFSWX%252F20261026%252Fus-east-1%252Fs3%252Faws4_request%26X-Amz-Date%3D20261026T015659Z%26X-Amz-Expires%3D86046%26X-Amz-Signature%3De5abf0c7fb2a8584948e05f86db5e2a9c78cb8e1779d35e65c17576cba1c6543%26X-Amz-SignedHeaders%3Dhost%26response-expires%3DTue%252C%252027%2520Oct%25202026%252001%253A51%253A05%2520GMT&osig=AAAAAAAAAAAAAAAAAAAAABOaZOLUSWbE6F3qRwXsZmEMB73hvVg5BUEP8rrurXk5&page=4&signed=brand%2Cfallback%2Cpage%2Cversion&signer=document-rpc&version=1',
  'https://media.canva.com/v2/document-image/hash:-55909024/height:335/id:DAHZKIvh2C4/type:B/width:596?brand=BAEcoFJ6npA&csig=AAAAAAAAAAAAAAAAAAAAAMF4rGRs_cglrwStdJChnBS6LdS2640iewfrCrMwNAEP&exp=1793068019&fallback=https%3A%2F%2Fs3.amazonaws.com%2Fdocument-export-us1.canva.com%2Fvh2C4%2FDAHZKIvh2C4%2F1%2Fthumbnail%2F0005.png%3FX-Amz-Algorithm%3DAWS4-HMAC-SHA256%26X-Amz-Credential%3DAKIAQYCGKMUH545XFSWX%252F20261026%252Fus-east-1%252Fs3%252Faws4_request%26X-Amz-Date%3D20261026T152139Z%26X-Amz-Expires%3D41025%26X-Amz-Signature%3Ddc596e5a31c6510579d0b7d798bef7fda1af05c6ef09eba3abd36844cb8ee975%26X-Amz-SignedHeaders%3Dhost%26response-expires%3DTue%252C%252027%2520Oct%25202026%252002%253A45%253A24%2520GMT&osig=AAAAAAAAAAAAAAAAAAAAAEh4KXZb6jIgwH0R1CgtYdB8TivMRhcsEP7K35njFrSW&page=5&signed=brand%2Cfallback%2Cpage%2Cversion&signer=document-rpc&version=1',
  'https://media.canva.com/v2/document-image/hash:-510054192/height:335/id:DAHZKIvh2C4/type:B/width:596?brand=BAEcoFJ6npA&csig=AAAAAAAAAAAAAAAAAAAAAFo2XhXSP7aPgYmHS01z-9OvYZmyd6kzzUD3heSoWIgJ&exp=1793068019&fallback=https%3A%2F%2Fs3.amazonaws.com%2Fdocument-export-us1.canva.com%2Fvh2C4%2FDAHZKIvh2C4%2F1%2Fthumbnail%2F0006.png%3FX-Amz-Algorithm%3DAWS4-HMAC-SHA256%26X-Amz-Credential%3DAKIAQYCGKMUH545XFSWX%252F20261026%252Fus-east-1%252Fs3%252Faws4_request%26X-Amz-Date%3D20261026T101929Z%26X-Amz-Expires%3D58560%26X-Amz-Signature%3Df629802e76f47649c06cf76f9a7d6c1d8c474721559d1782ab4edef5ed723e91%26X-Amz-SignedHeaders%3Dhost%26response-expires%3DTue%252C%252027%2520Oct%25202026%252002%253A35%253A29%2520GMT&osig=AAAAAAAAAAAAAAAAAAAAAA78puoRoC_IZSIkWmG3U31w_ePO5EDq3nHW1L0_l5Ka&page=6&signed=brand%2Cfallback%2Cpage%2Cversion&signer=document-rpc&version=1',
  'https://media.canva.com/v2/document-image/hash:-1897297084/height:335/id:DAHZKIvh2C4/type:B/width:596?brand=BAEcoFJ6npA&csig=AAAAAAAAAAAAAAAAAAAAAMt0DyBeyqsnPCrumqJDczvH7QYLPNZb8tW93_X_Wnvo&exp=1793068019&fallback=https%3A%2F%2Fs3.amazonaws.com%2Fdocument-export-us1.canva.com%2Fvh2C4%2FDAHZKIvh2C4%2F1%2Fthumbnail%2F0007.png%3FX-Amz-Algorithm%3DAWS4-HMAC-SHA256%26X-Amz-Credential%3DAKIAQYCGKMUH545XFSWX%252F20261026%252Fus-east-1%252Fs3%252Faws4_request%26X-Amz-Date%3D20261026T032836Z%26X-Amz-Expires%3D80639%26X-Amz-Signature%3Debd616a5216d919eba98806b0f577c8fda15c89123d12b24dc204713a8b8195f%26X-Amz-SignedHeaders%3Dhost%26response-expires%3DTue%252C%252027%2520Oct%25202026%252001%253A52%253A35%2520GMT&osig=AAAAAAAAAAAAAAAAAAAAAHdTIRORflGEQz6Z8pTPgyUOhd2eqKTM1hIPCmU72jZL&page=7&signed=brand%2Cfallback%2Cpage%2Cversion&signer=document-rpc&version=1',
  'https://media.canva.com/v2/document-image/hash:312059968/height:335/id:DAHZKIvh2C4/type:B/width:596?brand=BAEcoFJ6npA&csig=AAAAAAAAAAAAAAAAAAAAACDujNUHrbbFEEvpKlKoOl8Ch2xq3eLBSQEMavB1aYiZ&exp=1793068019&fallback=https%3A%2F%2Fs3.amazonaws.com%2Fdocument-export-us1.canva.com%2Fvh2C4%2FDAHZKIvh2C4%2F1%2Fthumbnail%2F0008.png%3FX-Amz-Algorithm%3DAWS4-HMAC-SHA256%26X-Amz-Credential%3DAKIAQYCGKMUH545XFSWX%252F20261026%252Fus-east-1%252Fs3%252Faws4_request%26X-Amz-Date%3D20261026T151243Z%26X-Amz-Expires%3D39943%26X-Amz-Signature%3D753085c07c9dd8611f6afdcae376e0ce73b7f69edce5828714723398fe930dce%26X-Amz-SignedHeaders%3Dhost%26response-expires%3DTue%252C%252027%2520Oct%25202026%252002%253A18%253A26%2520GMT&osig=AAAAAAAAAAAAAAAAAAAAAPRq6H6CKpzzDy-FLrm4D43aX-KoZ2ZzMEMwd8wDfMES&page=8&signed=brand%2Cfallback%2Cpage%2Cversion&signer=document-rpc&version=1',
  'https://media.canva.com/v2/document-image/hash:1744130952/height:335/id:DAHZKIvh2C4/type:B/width:596?brand=BAEcoFJ6npA&csig=AAAAAAAAAAAAAAAAAAAAAMf6yzazNl98BtjnEf-RaN3fr4V8OGCnVHvNQ0e287x0&exp=1793068019&fallback=https%3A%2F%2Fs3.amazonaws.com%2Fdocument-export-us1.canva.com%2Fvh2C4%2FDAHZKIvh2C4%2F1%2Fthumbnail%2F0009.png%3FX-Amz-Algorithm%3DAWS4-HMAC-SHA256%26X-Amz-Credential%3DAKIAQYCGKMUH545XFSWX%252F20261026%252Fus-east-1%252Fs3%252Faws4_request%26X-Amz-Date%3D20261026T015124Z%26X-Amz-Expires%3D87410%26X-Amz-Signature%3D450f8499acb5af6396d3e6b8fdcb23cda2093aecda31e29204c646f3df6dc6f4%26X-Amz-SignedHeaders%3Dhost%26response-expires%3DTue%252C%252027%2520Oct%25202026%252002%253A08%253A14%2520GMT&osig=AAAAAAAAAAAAAAAAAAAAAGWDZoute-uXq9-6v3j9JllqqjyvqP3BtPuR3sFXD2Jc&page=9&signed=brand%2Cfallback%2Cpage%2Cversion&signer=document-rpc&version=1',
  'https://media.canva.com/v2/document-image/hash:1114369696/height:335/id:DAHZKIvh2C4/type:B/width:596?brand=BAEcoFJ6npA&csig=AAAAAAAAAAAAAAAAAAAAAK6H7qZXFv3ldhwjQwTz65G8RW2mnmmKa0-aflJksAuK&exp=1793068019&fallback=https%3A%2F%2Fs3.amazonaws.com%2Fdocument-export-us1.canva.com%2Fvh2C4%2FDAHZKIvh2C4%2F1%2Fthumbnail%2F0010.png%3FX-Amz-Algorithm%3DAWS4-HMAC-SHA256%26X-Amz-Credential%3DAKIAQYCGKMUH545XFSWX%252F20261026%252Fus-east-1%252Fs3%252Faws4_request%26X-Amz-Date%3D20261026T034707Z%26X-Amz-Expires%3D81557%26X-Amz-Signature%3D939f66c78f962a2fd52471587f2cbb20e05c1adc300152eeb0bbe56892863e18%26X-Amz-SignedHeaders%3Dhost%26response-expires%3DTue%252C%252027%2520Oct%25202026%252002%253A26%253A24%2520GMT&osig=AAAAAAAAAAAAAAAAAAAAAGvhAe4zvJc9xKD0UD_AD2G74QR72YFuUte53odH9n-a&page=10&signed=brand%2Cfallback%2Cpage%2Cversion&signer=document-rpc&version=1',
  'https://media.canva.com/v2/document-image/hash:1763452016/height:335/id:DAHZKIvh2C4/type:B/width:596?brand=BAEcoFJ6npA&csig=AAAAAAAAAAAAAAAAAAAAAHZGtQBe_fD97bp1OUC29R75nQJ4cTl5Xv1uJRKMxCPT&exp=1793068019&fallback=https%3A%2F%2Fs3.amazonaws.com%2Fdocument-export-us1.canva.com%2Fvh2C4%2FDAHZKIvh2C4%2F1%2Fthumbnail%2F0011.png%3FX-Amz-Algorithm%3DAWS4-HMAC-SHA256%26X-Amz-Credential%3DAKIAQYCGKMUH545XFSWX%252F20261026%252Fus-east-1%252Fs3%252Faws4_request%26X-Amz-Date%3D20261026T194238Z%26X-Amz-Expires%3D23391%26X-Amz-Signature%3D22f935bef2716dcfcfdd6d26a41535e5aa60762d8e0fb0a8949c3f87b5353521%26X-Amz-SignedHeaders%3Dhost%26response-expires%3DTue%252C%252027%2520Oct%25202026%252002%253A12%253A29%2520GMT&osig=AAAAAAAAAAAAAAAAAAAAAMdFvjxKOGuPXthZ_dmXmdZXwAL6D6riag_-E23F9YhG&page=11&signed=brand%2Cfallback%2Cpage%2Cversion&signer=document-rpc&version=1',
  'https://media.canva.com/v2/document-image/hash:-1703802986/height:335/id:DAHZKIvh2C4/type:B/width:596?brand=BAEcoFJ6npA&csig=AAAAAAAAAAAAAAAAAAAAAA95azxR9qQTN-T3H2sHgfXqeUtDb24DBrrvC3o6yqwh&exp=1793068019&fallback=https%3A%2F%2Fs3.amazonaws.com%2Fdocument-export-us1.canva.com%2Fvh2C4%2FDAHZKIvh2C4%2F1%2Fthumbnail%2F0012.png%3FX-Amz-Algorithm%3DAWS4-HMAC-SHA256%26X-Amz-Credential%3DAKIAQYCGKMUH545XFSWX%252F20261026%252Fus-east-1%252Fs3%252Faws4_request%26X-Amz-Date%3D20261026T231238Z%26X-Amz-Expires%3D12204%26X-Amz-Signature%3D14d39fa22d9971a575d114b917692956b8e3da0535914cac46761ce32e77b787%26X-Amz-SignedHeaders%3Dhost%26response-expires%3DTue%252C%252027%2520Oct%25202026%252002%253A36%253A02%2520GMT&osig=AAAAAAAAAAAAAAAAAAAAAOuLwecOs7r9pvob0fwga7lSVO5YkbV10SNvi94wSLTt&page=12&signed=brand%2Cfallback%2Cpage%2Cversion&signer=document-rpc&version=1',
];

const configs: Record<string, PitchConfig> = {
  'ghana-jh': {
    code: 'johnnie_hayford',
    badge: 'iPurpose × SDSN Youth Ghana',
    title: 'Ghana Discovery Pilot Partnership Concept',
    subtitle: 'A focused concept for an 8-week Ghana pilot connecting self-discovery, AI-guided decision support and verified opportunity pathways.',
    recipient: 'Prepared for Johnnie Kojo Hayford, Network Coordinator, SDSN Youth Ghana',
    slides: ghanaSlides,
  },
  'africa-lm': {
    code: 'lara_mugala',
    badge: 'iPurpose × SDSN Youth Africa',
    title: 'Ghana Discovery Pilot with Africa Replication Pathway',
    subtitle: 'A Ghana-first learning pilot designed to build evidence that could inform broader African replication.',
    recipient: 'Prepared for Lara Mugala, Regional Focal Point, Africa',
    slides: [],
  },
  'global-partnership': {
    code: 'global_partnership',
    badge: 'iPurpose × SDSN Youth',
    title: 'Ghana Discovery Pilot & African Replication Partnership',
    subtitle: 'A locally grounded Ghana pilot designed to produce measurable evidence before broader replication.',
    recipient: 'Prepared for SDSN Youth Global Partnerships',
    slides: [],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ audience: string }> }): Promise<Metadata> {
  const { audience } = await params;
  const config = configs[audience];
  if (!config) return {};
  return {
    title: `${config.title} · iPurpose`,
    description: config.subtitle,
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function SDSNPitchPage({ params }: { params: Promise<{ audience: string }> }) {
  const { audience } = await params;
  const config = configs[audience];
  if (!config) notFound();

  return (
    <main className="min-h-screen bg-[#F5F7FA] text-[#4B4E6D]">
      <PitchAnalytics audience={config.code} />

      <section className="relative overflow-hidden bg-gradient-to-br from-[#4B4E6D] to-[#252943] px-6 py-12 sm:px-10 sm:py-16">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#9C88FF]/70" />
        <div className="absolute -bottom-28 right-20 h-64 w-64 rounded-full bg-[#FCC4B7]/75" />
        <div className="relative mx-auto max-w-6xl">
          <div className="flex items-center gap-4">
            <img src="/images/my-logo.png" alt="iPurpose" className="h-16 w-16 rounded-full object-cover sm:h-20 sm:w-20" />
            <div>
              <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#E6C87C]">{config.badge}</div>
              <div className="mt-1 text-sm text-white/70">Soul . Systems . AI.</div>
            </div>
          </div>

          <h1 className="mt-8 max-w-4xl text-4xl font-bold leading-tight text-white sm:text-5xl">{config.title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/80">{config.subtitle}</p>

          <div className="mt-8 border-l-2 border-[#E6C87C] pl-4 text-sm leading-6 text-white/72">
            <div>{config.recipient}</div>
            <div className="mt-1 font-semibold text-white">Renita Hamilton, MPS · Founder, iPurpose</div>
            <div>Strategic Leadership · Social Impact · AI-Enabled Human Development</div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-8 sm:py-14">
        {config.slides.length ? (
          <PresentationCarousel slides={config.slides} audience={config.code} />
        ) : (
          <div className="mx-auto max-w-4xl rounded-2xl bg-white p-10 text-center shadow-sm">
            <h2 className="text-2xl font-bold">Presentation preview is being prepared.</h2>
            <p className="mt-3 text-base text-[#6f7489]">This version will use the same presentation-first format as the Ghana concept.</p>
          </div>
        )}
      </section>

      <section className="border-t border-[#E5E7EF] bg-white px-6 py-10">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-2xl font-bold text-[#4B4E6D]">Interested in exploring the pilot?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-[#6f7489]">
            I would welcome a 30-minute exploratory conversation to discuss fit, local context and the right partnership structure.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              data-pitch-action="contact_founder"
              href="/contact"
              className="rounded-full bg-gradient-to-r from-[#9C88FF] to-[#4B4E6D] px-7 py-3.5 text-base font-bold text-white shadow-sm hover:brightness-105"
            >
              Contact Renita
            </a>
            <a
              data-pitch-action="visit_ipurpose"
              href="https://ipurposesoul.com"
              className="rounded-full border border-[#4B4E6D] px-7 py-3.5 text-base font-bold text-[#4B4E6D] hover:bg-[#F5F7FA]"
            >
              Visit iPurpose
            </a>
          </div>
          <p className="mt-5 text-sm text-[#6f7489]">Email: <strong>renita@ipurposesoul.com</strong></p>
        </div>
      </section>

      <footer className="bg-[#252943] px-6 py-6 text-center text-xs leading-5 text-white/60">
        <div>© 2026 iPurpose. All rights reserved. · Soul . Systems . AI.</div>
        <div className="mt-1">Unlisted, no-index partnership concept prepared for exploratory discussion.</div>
      </footer>
    </main>
  );
}
