import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import CertificateList from '@/views/CertificateList.vue';
import { ElMessage } from 'element-plus';
import { nextTick } from 'vue';

// Mock Element Plus message
jest.mock('element-plus', () => ({
  ElMessage: jest.fn()
}));

describe('CertificateList.vue', () => {
  let wrapper;
  const mockCertificates = [
    {
      token_id: '1',
      title: 'Test Certificate 1',
      description: 'Test Description 1',
      image_url: 'https://example.com/image1.jpg',
      owner_address: '0x1234...',
      status: 'active'
    },
    {
      token_id: '2',
      title: 'Test Certificate 2',
      description: 'Test Description 2',
      image_url: 'https://example.com/image2.jpg',
      owner_address: '0x5678...',
      status: 'active'
    }
  ];

  beforeEach(() => {
    // Create fresh wrapper for each test
    wrapper = mount(CertificateList, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              certificate: {
                certificates: mockCertificates,
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

  it('renders certificate list correctly', () => {
    const cards = wrapper.findAll('.certificate-card');
    expect(cards).toHaveLength(mockCertificates.length);
  });

  it('displays certificate details correctly', () => {
    const firstCard = wrapper.find('.certificate-card');
    expect(firstCard.text()).toContain(mockCertificates[0].title);
    expect(firstCard.text()).toContain(mockCertificates[0].description);
  });

  it('filters certificates correctly', async () => {
    const searchInput = wrapper.find('.search-input');
    await searchInput.setValue('Certificate 1');
    await nextTick();

    const cards = wrapper.findAll('.certificate-card');
    expect(cards).toHaveLength(1);
    expect(cards[0].text()).toContain('Test Certificate 1');
  });

  it('shows loading state', async () => {
    wrapper = mount(CertificateList, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              certificate: {
                certificates: [],
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
    wrapper = mount(CertificateList, {
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              certificate: {
                certificates: [],
                loading: false,
                error: 'Failed to load certificates'
              }
            }
          })
        ]
      }
    });

    expect(wrapper.find('.error-message').text()).toContain('Failed to load certificates');
  });

  it('handles pagination correctly', async () => {
    const pagination = wrapper.find('.el-pagination');
    await pagination.vm.$emit('current-change', 2);
    
    // Verify that the store action was called
    expect(wrapper.vm.$store.dispatch).toHaveBeenCalledWith('certificate/fetchCertificates', {
      page: 2
    });
  });
});
