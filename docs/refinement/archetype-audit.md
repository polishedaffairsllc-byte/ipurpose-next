# Purpose profile audit — October 5, 2026

Before implementation: nine approved Purpose signals, nine partial profiles (direction phrase and scored signal already exist), zero complete interpretive profiles, zero unsupported/missing scored signals. The full interpretation/strengths presentation was absent for all nine. No new archetype or owner content decision is needed to complete the current framework.

| Approved Purpose name | Before this batch | After this batch | Existing source of interpretation |
| --- | --- | --- | --- |
| Belonging | Partial | Complete | Understanding/less alone; community; family/home; fewer people alone |
| Teaching | Partial | Complete | Explanation clicking; learning/growth; life-changing understanding |
| Access | Partial | Complete | Opening doors; unequal opportunity; expanding options/getting started |
| Creative expression | Partial | Complete | Making something new; beauty/originality; ideas/stories |
| Justice | Partial | Complete | Fairness/honesty; integrity; unequal opportunity; fixing unfairness |
| Stability | Partial | Complete | Security for loved ones; family/community; steadiness |
| Healing | Partial | Complete | Caring in difficulty; healing/getting through hard things; safety |
| Problem solving | Partial | Complete | Untangling stuck problems; broken/inefficient systems; things working |
| Independence | Partial | Complete | Own terms; freedom/self-direction; options/choosing a path |

Inventory authority: `mobile/src/lib/purposeCheckCopy.ts` (`SIGNALS`, approved six questions, signal phrases). All names are preserved verbatim. The implementation is `mobile/src/lib/purposeProfiles.ts`.

Each saved result now derives a profile name from its existing one to three ranked signals. It includes the exact saved Purpose Direction, defining signal interpretations/strengths, saved audience, and saved impact. Profiles combine the existing signals without inventing named compound archetypes. The catalog is display content only: no score, ranking, tie rule, question, option, or persisted record changes. All nine entries use the same presentation. Optional saved reflection remains governed by the existing explicit checkbox.

Clarity/Identity's separate five-name inventory is Visionary, Builder, Nurturer, Strategist, Creator. Its existing descriptions and Purpose pairing stay intact. These are not renamed into Purpose archetypes. Older Soul selectors/content elsewhere have another legacy inventory; expanding or reconciling that unrelated framework is outside this Purpose Check batch.

No owner input is necessary for implementation. Owner review should confirm the supporting prose before a replacement build; it is derived from the approved answer wording and framework, rather than presented as a newly approved scoring taxonomy. Healing is explicitly not a clinical qualification.
