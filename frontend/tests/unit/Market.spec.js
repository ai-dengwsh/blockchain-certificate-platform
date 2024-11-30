import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import Market from '@/views/Market.vue';
import { ElMessage } from 'element-plus';
import { nextTick } from 'vue';

jest.mock('element-plus', () => ({
  ElMessage: jest.fn()
}));

describe('Market.vue', () => {
  let wrapper;
  const mockListings = [
    {
      id: '1',
      token_id: '1',
      title: 'Certificate 1',
      price: '1000000000000000000', // 1 ETH
      seller_address: '0x1234...',
      status: 'active'
    },
    {
      id: '2',
      token_id: '2',
      title: 'Certificate 2',
      price: '2000000000000000000', // 2 ETH
      seller_address: '0x5678...',
      status: 'active'
    }
  ];

  beforeEach(() => {
    wrapper = mount(Market, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              market: {
                listings: mockListings,
                loading: false,
                error: null
              }
            }
          })
        ],
        stubs: ['router-link']
      }
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('renders market listings correctly', () => {
    const listings = wrapper.findAll('.market-item');
    expect(listings).toHaveLength(mockListings.length);
  });

  it('displays listing details correctly', () => {
    const firstListing = wrapper.find('.market-item');
    expect(firstListing.text()).toContain('Certificate 1');
    expect(firstListing.text()).toContain('1 ETH');
  });

  it('filters listings by price range', async () => {
    const minPrice = wrapper.find('.min-price-input');
    const maxPrice = wrapper.find('.max-price-input');
    
    await minPrice.setValue('0.5');
    await maxPrice.setValue('1.5');
    await wrapper.find('.filter-button').trigger('click');
    
    await nextTick();
    
    const listings = wrapper.findAll('.market-item');
    expect(listings).toHaveLength(1);
    expect(listings[0].text()).toContain('Certificate 1');
  });

  it('sorts listings by price', async () => {
    const sortSelect = wrapper.find('.sort-select');
    await sortSelect.setValue('price_desc');
    
    await nextTick();
    
    const listings = wrapper.findAll('.market-item');
    expect(listings[0].text()).toContain('Certificate 2');
    expect(listings[1].text()).toContain('Certificate 1');
  });

  it('handles buy action correctly', async () => {
    const buyButton = wrapper.find('.buy-button');
    await buyButton.trigger('click');
    
    // Verify confirmation dialog is shown
    expect(wrapper.find('.confirm-dialog').exists()).toBe(true);
    
    // Confirm purchase
    await wrapper.find('.confirm-button').trigger('click');
    
    // Verify purchase action was dispatched
    expect(wrapper.vm.$store.dispatch).toHaveBeenCalledWith('market/purchaseCertificate', {
      listingId: '1'
    });
  });

  it('shows loading state', async () => {
    wrapper = mount(Market, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              market: {
                listings: [],
                loading: true,
                error: null
              }
            }
          })
        ]
      }
    });

    expect(wrapper.find('.loading-spinner').exists()).toBe(true);
  });

  it('shows error message when loading fails', async () => {
    wrapper = mount(Market, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              market: {
                listings: [],
                loading: false,
                error: 'Failed to load market listings'
              }
            }
          })
        ]
      }
    });

    expect(wrapper.find('.error-message').text()).toContain('Failed to load market listings');
  });
});
