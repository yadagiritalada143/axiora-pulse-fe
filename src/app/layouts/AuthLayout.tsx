import { Outlet } from 'react-router-dom';

const STRIPE_POSITIONS = ['-2%', '19%', '40%', '61%', '82%'];

/**
 * Auth screens (login/register/forgot/reset password) share this shell.
 * - Mobile: a short hero band up top (logo badge + heading) with the form
 *   presented as a rounded "bottom sheet" overlapping its lower edge.
 * - Desktop (lg+): the classic two-column split, hero panel on the left,
 *   form centered on the right.
 * Mirrors the design reference's layout without reusing its literal copy.
 */
export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-2">
      <div className="relative min-h-[20rem] overflow-hidden rounded-b-3xl bg-[#141414] text-white lg:min-h-screen lg:rounded-none">
        {' '}
        {/* Warm glow blooming up from the bottom edge, brightest (white) at the base,
            fading through gold and orange into black at the top of the panel */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div
            className="absolute -inset-x-1/4 top-[55%] h-[160%] lg:top-[75%] lg:h-[100%]"
            style={{ background: '#D94B23', filter: 'blur(90px)' }}
          />

          <div
            className="absolute -inset-x-1/4 top-[72%] h-[160%] lg:top-[82%] lg:h-[70%]"
            style={{ background: '#D99423', filter: 'blur(90px)', mixBlendMode: 'screen' }}
          />

          <div
            className="absolute -inset-x-1/4 top-[88%] h-[160%] lg:top-[95%] lg:h-[55%]"
            style={{ background: '#FFFFFF', filter: 'blur(90px)', mixBlendMode: 'screen' }}
          />

          {/* Faint vertical light columns */}
          {STRIPE_POSITIONS.map((left) => (
            <div
              key={left}
              className="absolute top-0 h-full w-[21%] backdrop-blur-[8px]"
              style={{
                left,
                background:
                  'linear-gradient(270deg, rgba(168,168,168,0.05) 0%, rgba(217,217,217,0) 100%)',
              }}
            />
          ))}
          {/* Darken the top half so the heading stays legible over the glow */}
          {/* <div className="absolute inset-0 bg-gradient-to-b from-[#141414] via-[#141414]/40 to-transparent" /> */}
        </div>
        <div className="relative z-10 flex h-full flex-col items-center justify-start px-6 pt-10 text-center lg:h-full lg:w-full lg:px-12 lg:pt-24 lg:text-left">
          {' '}
          <div className="mb-5 flex items-center justify-center lg:hidden">
            <div className="mb-5 flex items-center justify-center lg:hidden">
              <div className="flex size-16 items-center justify-center rounded-full bg-white">
                <div className="bg-primary/10 flex size-14 items-center justify-center rounded-full">
                  <div className="bg-primary/15 flex size-11 items-center justify-center rounded-full">
                    <div className="bg-primary size-10 rounded-full shadow-[0_0_12px_3px_rgba(59,130,246,0.25)]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h1 className="font-display w-full text-3xl leading-tight font-semibold tracking-wide lg:text-6xl lg:leading-[1.1]">
            Turn <span className="text-primary">Ideas</span> into{' '}
            <span className="text-primary">Business</span> Model
          </h1>
        </div>
      </div>

      <div className="relative z-10 -mt-6 flex flex-1 flex-col rounded-t-3xl bg-white px-6 pt-8 pb-8 text-black lg:mt-0 lg:flex-1 lg:items-center lg:justify-center lg:rounded-none lg:p-10">
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col lg:flex-none">
          <div className="mb-6 hidden lg:flex">
            <div className="flex size-14 items-center justify-center rounded-full bg-blue-500/5">
              <div className="flex size-11 items-center justify-center rounded-full bg-blue-500/10">
                <div className="flex size-9 items-center justify-center rounded-full bg-blue-500/15">
                  <div className="size-4 rounded-full bg-blue-500 shadow-[0_0_12px_3px_rgba(59,130,246,0.45)]" />
                </div>
              </div>
            </div>
          </div>

          <Outlet />

          {/* No dedicated policy pages yet - plain text until those routes exist. */}
          <div className="mt-auto flex justify-center gap-6 pt-10 text-xs text-gray-600 lg:absolute lg:right-10 lg:bottom-10 lg:mt-0 lg:justify-end lg:pt-0">
            <span>Privacy policy</span>
            <span>Legal terms</span>
          </div>
        </div>
      </div>
    </div>
  );
}
