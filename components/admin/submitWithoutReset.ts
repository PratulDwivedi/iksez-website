import { startTransition, type FormEvent } from 'react';

// React 19 resets every <form action={fn}> once the action settles — even
// when the server action returns { error }, which wipes everything the admin
// typed. Submitting through onSubmit and calling the useActionState dispatch
// ourselves keeps the same pending/state behavior (and server-side redirect
// on success) but skips that automatic reset, so a failed save keeps its
// values for the admin to fix and resubmit.
export function submitWithoutReset(formAction: (payload: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(() => formAction(formData));
  };
}
