const handleError = (error: unknown) => {
  toast.error(
    error instanceof Error 
      ? error.message
      : 'Failed to save changes. Please try again.'
  );
  queryClient.setQueryData(['task', tempId], previousTask);
}; 

const mutation = useMutation({
  mutationFn: taskMutation,
  onMutate: () => {
    // Disable button during mutation
    queryClient.setQueryData(['task', tempId], (old) => ({
      ...old,
      isSubmitting: true
    }));
  },
  onError: (error) => {
    toast.error(error.message || 'Network error occurred');
    queryClient.setQueryData(['task', tempId], (old) => ({
      ...old,
      isSubmitting: false
    }));
  }
}); 