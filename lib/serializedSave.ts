/** Preserve edit order and recover the queue after a failed request. */
export function createSaveQueue() {
  let previous: Promise<void> = Promise.resolve();
  return (write: () => Promise<Response>): Promise<void> => {
    const next = previous.catch(() => undefined).then(async () => {
      const response = await write();
      if (!response.ok) throw new Error('Your changes could not be saved. Please try again.');
    });
    previous = next;
    return next;
  };
}
