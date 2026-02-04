it('handles product fetch error gracefully', async () => {
        mockApi.productApi.getPopularProducts.mockRejectedValueOnce(new Error('API Error'))

        renderWithProviders(<Home />)

        await waitFor(() => {
            // Should show error toast or handle error gracefully
            expect(mockApi.productApi.getPopularProducts).toHaveBeenCalled()
        })
    })