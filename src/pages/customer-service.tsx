import { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Button,
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Textarea,
  Input,
  Select,
  FormControl,
  FormLabel,
  FormHelperText,
  Icon,
  Divider,
  Link,
  Wrap,
  WrapItem,
  Spinner,
} from '@chakra-ui/react';
import { FaHeadset, FaQuestionCircle, FaEnvelope, FaPhone, FaClock, FaMapMarkerAlt, FaChevronDown } from 'react-icons/fa';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

interface ContactInfo {
  type: string;
  value: string;
  icon: any;
  description: string;
}

interface InquiryForm {
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
}

export default function CustomerServicePage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [inquiryForm, setInquiryForm] = useState<InquiryForm>({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toast = useToast();

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'service', label: '서비스 이용' },
    { value: 'payment', label: '결제/환불' },
    { value: 'technical', label: '기술 지원' },
    { value: 'account', label: '계정 관리' },
  ];

  const faqs: FAQ[] = [
    {
      id: 1,
      question: 'AI 여행 계획 생성은 어떻게 작동하나요?',
      answer: 'AI가 사용자가 선택한 지역, 여행 기간, 관심사 등을 분석하여 최적의 여행 일정을 자동으로 생성합니다. 관광지, 식당, 숙박시설을 포함한 상세한 일정과 예상 비용을 제공합니다.',
      category: 'service',
    },
    {
      id: 2,
      question: '여행 계획을 수정할 수 있나요?',
      answer: '네, 생성된 여행 계획은 언제든지 수정 가능합니다. 특정 장소를 변경하거나 시간을 조정할 수 있으며, AI가 수정된 내용을 반영하여 새로운 계획을 제안합니다.',
      category: 'service',
    },
    {
      id: 3,
      question: '결제 후 환불이 가능한가요?',
      answer: '서비스 이용 시작 전까지는 전액 환불이 가능합니다. 이용 시작 후에는 남은 기간에 비례하여 환불해드립니다. 자세한 환불 정책은 고객센터로 문의해주세요.',
      category: 'payment',
    },
    {
      id: 4,
      question: '여행 계획을 다른 사람과 공유할 수 있나요?',
      answer: '네, 생성된 여행 계획은 링크를 통해 다른 사람과 공유할 수 있습니다. 공유받은 사람은 계획을 확인하고 댓글을 남길 수 있습니다.',
      category: 'service',
    },
    {
      id: 5,
      question: '모바일에서도 사용할 수 있나요?',
      answer: '네, 반응형 웹 디자인으로 모든 기기에서 최적화된 경험을 제공합니다. 스마트폰, 태블릿, 데스크톱에서 모두 편리하게 이용할 수 있습니다.',
      category: 'technical',
    },
    {
      id: 6,
      question: '비밀번호를 잊어버렸어요. 어떻게 해야 하나요?',
      answer: '로그인 페이지의 "비밀번호 찾기" 기능을 이용하세요. 가입 시 등록한 이메일로 비밀번호 재설정 링크를 보내드립니다.',
      category: 'account',
    },
    {
      id: 7,
      question: 'AI 추천의 정확도는 어느 정도인가요?',
      answer: 'AI는 수많은 사용자 데이터와 리뷰를 분석하여 개인화된 추천을 제공합니다. 정확도는 약 85% 이상이며, 지속적으로 개선되고 있습니다.',
      category: 'service',
    },
    {
      id: 8,
      question: '여행 중 실시간으로 계획을 변경할 수 있나요?',
      answer: '네, 모바일에서도 실시간으로 계획을 수정할 수 있습니다. 날씨나 상황에 따라 즉시 대안을 제시받을 수 있습니다.',
      category: 'service',
    },
  ];

  const contactInfo: ContactInfo[] = [
    {
      type: '고객센터',
      value: '1588-1234',
      icon: FaHeadset,
      description: '평일 09:00-18:00',
    },
    {
      type: '이메일',
      value: 'support@aitravel.com',
      icon: FaEnvelope,
      description: '24시간 접수 가능',
    },
    {
      type: '카카오톡',
      value: '@AI여행고객센터',
      icon: FaQuestionCircle,
      description: '실시간 상담',
    },
    {
      type: '주소',
      value: '서울특별시 강남구 테헤란로 123',
      icon: FaMapMarkerAlt,
      description: 'AI Travel 본사',
    },
  ];

  const handleInquirySubmit = async () => {
    // 입력 검증
    if (!inquiryForm.name || !inquiryForm.email || !inquiryForm.subject || !inquiryForm.message) {
      toast({
        title: '입력 오류',
        description: '모든 필수 항목을 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inquiryForm.email)) {
      toast({
        title: '이메일 형식 오류',
        description: '올바른 이메일 주소를 입력해주세요.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Firebase Firestore에 문의 데이터 저장
      const inquiryData = {
        ...inquiryForm,
        createdAt: serverTimestamp(),
        status: 'pending',
        read: false,
      };

      const docRef = await addDoc(collection(db, 'inquiries'), inquiryData);

      toast({
        title: '문의 접수 완료!',
        description: `문의번호: ${docRef.id.slice(-8).toUpperCase()}. 빠른 시일 내에 답변드리겠습니다.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // 폼 초기화
      setInquiryForm({
        name: '',
        email: '',
        category: '',
        subject: '',
        message: '',
      });

    } catch (error) {
      console.error('문의 접수 오류:', error);
      toast({
        title: '문의 접수 실패',
        description: '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredFaqs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <Container maxW="container.lg" py={{ base: 20, md: 8 }} px={{ base: 4, md: 6 }}>
      <VStack spacing={{ base: 6, md: 8 }} align="stretch">
        {/* 헤더 섹션 */}
        <Box bg="white" borderRadius="2xl" boxShadow="lg" p={{ base: 4, md: 6 }}>
          <VStack spacing={4}>
            <HStack>
              <Icon as={FaHeadset} w={{ base: 6, md: 8 }} h={{ base: 6, md: 8 }} color="teal.500" />
              <Heading size={{ base: "md", md: "lg" }} color="teal.700">고객센터</Heading>
            </HStack>
            <Text color="gray.600" textAlign="center" fontSize={{ base: "sm", md: "md" }}>
              AI 여행 서비스 이용에 궁금한 점이 있으시면 언제든 문의해주세요!
            </Text>
          </VStack>
        </Box>

        {/* 연락처 정보 */}
        <Box bg="white" borderRadius="2xl" boxShadow="lg" p={{ base: 4, md: 6 }}>
          <Heading size={{ base: "sm", md: "md" }} mb={6} color="teal.700">연락처 정보</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
            {contactInfo.map((contact, index) => (
              <Box
                key={index}
                p={{ base: 3, md: 4 }}
                border="1px"
                borderColor="gray.200"
                borderRadius="xl"
                _hover={{ borderColor: 'teal.300', transform: 'translateY(-2px)' }}
                transition="all 0.2s"
                cursor="pointer"
              >
                <HStack spacing={3}>
                  <Icon as={contact.icon} w={{ base: 5, md: 6 }} h={{ base: 5, md: 6 }} color="teal.500" />
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="bold" color="teal.700" fontSize={{ base: "sm", md: "md" }}>
                      {contact.type}
                    </Text>
                    <Text fontSize={{ base: "md", md: "lg" }} color="gray.800" wordBreak="break-all">
                      {contact.value}
                    </Text>
                    <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                      {contact.description}
                    </Text>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* FAQ 섹션 */}
        <Box bg="white" borderRadius="2xl" boxShadow="lg" p={{ base: 4, md: 6 }}>
          <VStack spacing={6} align="stretch">
            <VStack spacing={4} align="stretch">
              <Heading size={{ base: "sm", md: "md" }} color="teal.700">자주 묻는 질문</Heading>
              
              {/* 모바일에서는 세로로, 데스크톱에서는 가로로 배치 */}
              <Wrap spacing={2} justify={{ base: "center", md: "flex-start" }}>
                {categories.map((category) => (
                  <WrapItem key={category.value}>
                    <Button
                      variant={selectedCategory === category.value ? 'solid' : 'outline'}
                      colorScheme="teal"
                      size={{ base: "sm", md: "sm" }}
                      onClick={() => setSelectedCategory(category.value)}
                      minW={{ base: "auto", md: "auto" }}
                      px={{ base: 3, md: 4 }}
                    >
                      {category.label}
                    </Button>
                  </WrapItem>
                ))}
              </Wrap>
            </VStack>

            <Accordion allowToggle>
              {filteredFaqs.map((faq) => (
                <AccordionItem key={faq.id} border="1px" borderColor="gray.200" borderRadius="lg" mb={2}>
                  <AccordionButton 
                    py={{ base: 3, md: 4 }} 
                    _hover={{ bg: 'gray.50' }}
                    minH={{ base: "48px", md: "auto" }}
                  >
                    <Box flex="1" textAlign="left" fontWeight="medium" color="teal.700" fontSize={{ base: "sm", md: "md" }}>
                      {faq.question}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4} color="gray.700" fontSize={{ base: "sm", md: "md" }}>
                    {faq.answer}
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </VStack>
        </Box>

        {/* 문의하기 폼 */}
        <Box bg="white" borderRadius="2xl" boxShadow="lg" p={{ base: 4, md: 6 }}>
          <Heading size={{ base: "sm", md: "md" }} mb={6} color="teal.700">1:1 문의하기</Heading>
          
          <VStack spacing={4} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isRequired>
                <FormLabel fontSize={{ base: "sm", md: "md" }}>이름</FormLabel>
                <Input
                  placeholder="이름을 입력하세요"
                  value={inquiryForm.name}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                  size={{ base: "md", md: "md" }}
                  isDisabled={isSubmitting}
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel fontSize={{ base: "sm", md: "md" }}>이메일</FormLabel>
                <Input
                  type="email"
                  placeholder="이메일을 입력하세요"
                  value={inquiryForm.email}
                  onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                  size={{ base: "md", md: "md" }}
                  isDisabled={isSubmitting}
                />
              </FormControl>
            </SimpleGrid>

            <FormControl>
              <FormLabel fontSize={{ base: "sm", md: "md" }}>문의 유형</FormLabel>
              <Select
                placeholder="문의 유형을 선택하세요"
                value={inquiryForm.category}
                onChange={(e) => setInquiryForm({ ...inquiryForm, category: e.target.value })}
                size={{ base: "md", md: "md" }}
                isDisabled={isSubmitting}
              >
                <option value="service">서비스 이용</option>
                <option value="payment">결제/환불</option>
                <option value="technical">기술 지원</option>
                <option value="account">계정 관리</option>
                <option value="other">기타</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize={{ base: "sm", md: "md" }}>제목</FormLabel>
              <Input
                placeholder="문의 제목을 입력하세요"
                value={inquiryForm.subject}
                onChange={(e) => setInquiryForm({ ...inquiryForm, subject: e.target.value })}
                size={{ base: "md", md: "md" }}
                isDisabled={isSubmitting}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel fontSize={{ base: "sm", md: "md" }}>문의 내용</FormLabel>
              <Textarea
                placeholder="문의 내용을 자세히 입력해주세요"
                rows={6}
                value={inquiryForm.message}
                onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
                size={{ base: "md", md: "md" }}
                minH={{ base: "120px", md: "150px" }}
                isDisabled={isSubmitting}
              />
              <FormHelperText fontSize={{ base: "xs", md: "sm" }}>
                구체적인 내용을 작성해주시면 더 정확한 답변을 드릴 수 있습니다.
              </FormHelperText>
            </FormControl>

            <Button
              colorScheme="teal"
              size={{ base: "lg", md: "lg" }}
              onClick={handleInquirySubmit}
              leftIcon={isSubmitting ? <Spinner size="sm" /> : <FaEnvelope />}
              w="full"
              isLoading={isSubmitting}
              loadingText="문의 접수 중..."
              isDisabled={isSubmitting}
            >
              {isSubmitting ? '문의 접수 중...' : '문의하기'}
            </Button>
          </VStack>
        </Box>

        {/* 운영 시간 안내 */}
        <Box bg="white" borderRadius="2xl" boxShadow="lg" p={{ base: 4, md: 6 }}>
          <Heading size={{ base: "sm", md: "md" }} mb={4} color="teal.700">운영 시간</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={{ base: 4, md: 6 }}>
            <VStack align="stretch" spacing={3}>
              <HStack>
                <Icon as={FaClock} color="teal" />
                <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>고객센터 운영시간</Text>
              </HStack>
              <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" pl={6}>
                평일: 09:00 - 18:00<br />
                토요일: 09:00 - 13:00<br />
                일요일 및 공휴일 휴무
              </Text>
            </VStack>
            
            <VStack align="stretch" spacing={3}>
              <HStack>
                <Icon as={FaEnvelope} color="teal" />
                <Text fontWeight="bold" fontSize={{ base: "sm", md: "md" }}>이메일 문의</Text>
              </HStack>
              <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600" pl={6}>
                24시간 접수 가능<br />
                평일 18:00 이후 접수된 문의는<br />
                다음 영업일에 답변드립니다.
              </Text>
            </VStack>
          </SimpleGrid>
        </Box>
      </VStack>
    </Container>
  );
} 