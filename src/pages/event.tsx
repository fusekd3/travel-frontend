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
  Image,
  Badge,
  useToast,
  Flex,
  useBreakpointValue,
  Icon,
  Progress,
} from '@chakra-ui/react';
import { FaGift, FaCalendar, FaMapMarkerAlt, FaUsers, FaClock, FaTag } from 'react-icons/fa';

interface Event {
  id: number;
  title: string;
  description: string;
  image_url: string;
  start_date: string;
  end_date: string;
  location: string;
  participants: number;
  max_participants: number;
  category: string;
  discount: string;
  status: 'ongoing' | 'upcoming' | 'ended';
}

export default function EventPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const categories = [
    { value: 'all', label: '전체' },
    { value: 'ongoing', label: '진행중' },
    { value: 'upcoming', label: '예정' },
    { value: 'discount', label: '할인' },
    { value: 'free', label: '무료' },
  ];

  const events: Event[] = [
    {
      id: 1,
      title: '봄맞이 AI 여행 계획 할인 이벤트',
      description: '봄철 여행을 위한 AI 맞춤 일정 생성 서비스를 30% 할인된 가격으로 이용하세요!',
      image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      start_date: '2024-03-01',
      end_date: '2024-05-31',
      location: '전국',
      participants: 156,
      max_participants: 200,
      category: 'discount',
      discount: '30% 할인',
      status: 'ongoing',
    },
    {
      id: 2,
      title: '제주도 무료 여행 가이드북 제공',
      description: 'AI가 추천한 제주도 여행지를 방문하고 인증하면 특별 제작된 가이드북을 무료로 받아가세요!',
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
      start_date: '2024-04-01',
      end_date: '2024-06-30',
      location: '제주도',
      participants: 89,
      max_participants: 100,
      category: 'free',
      discount: '무료',
      status: 'ongoing',
    },
    {
      id: 3,
      title: '여름 휴가 AI 여행 플래너 무료 체험',
      description: '여름 휴가 계획을 AI와 함께! 1주일간 무료로 프리미엄 AI 여행 플래너를 체험해보세요.',
      image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      start_date: '2024-06-01',
      end_date: '2024-08-31',
      location: '전국',
      participants: 0,
      max_participants: 500,
      category: 'free',
      discount: '무료',
      status: 'upcoming',
    },
    {
      id: 4,
      title: '가을 단풍 여행 패키지 20% 할인',
      description: '가을 단풍 명소를 AI가 추천해주는 특별 패키지! 숙박과 교통편까지 포함된 완벽한 여행을 할인된 가격으로.',
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
      start_date: '2024-09-01',
      end_date: '2024-11-30',
      location: '전국',
      participants: 0,
      max_participants: 300,
      category: 'discount',
      discount: '20% 할인',
      status: 'upcoming',
    },
    {
      id: 5,
      title: '겨울 스키 여행 AI 코스 추천',
      description: '겨울 스키장과 온천을 함께 즐기는 AI 추천 코스! 최적의 동선과 시간 배분으로 완벽한 겨울 여행을.',
      image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      start_date: '2024-12-01',
      end_date: '2025-02-28',
      location: '강원도',
      participants: 0,
      max_participants: 200,
      category: 'discount',
      discount: '15% 할인',
      status: 'upcoming',
    },
    {
      id: 6,
      title: 'AI 여행 리뷰 작성 이벤트',
      description: 'AI가 추천한 여행지를 방문하고 리뷰를 작성하면 추첨을 통해 여행 상품권을 드립니다!',
      image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
      start_date: '2024-01-01',
      end_date: '2024-12-31',
      location: '전국',
      participants: 234,
      max_participants: 1000,
      category: 'free',
      discount: '상품권 증정',
      status: 'ongoing',
    },
  ];

  const handleParticipate = (eventId: number) => {
    toast({
      title: '이벤트 참여 완료!',
      description: '이벤트 참여가 성공적으로 등록되었습니다.',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing': return 'green';
      case 'upcoming': return 'blue';
      case 'ended': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ongoing': return '진행중';
      case 'upcoming': return '예정';
      case 'ended': return '종료';
      default: return '알 수 없음';
    }
  };

  const filteredEvents = selectedCategory === 'all' 
    ? events 
    : events.filter(event => event.category === selectedCategory || event.status === selectedCategory);

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        {/* 헤더 섹션 */}
        <Box bg="white" borderRadius="2xl" boxShadow="lg" p={6}>
          <VStack spacing={4}>
            <HStack>
              <Icon as={FaGift} w={8} h={8} color="teal.500" />
              <Heading size="lg" color="teal.700">이벤트 & 프로모션</Heading>
            </HStack>
            <Text color="gray.600" textAlign="center">
              AI 여행 서비스를 더욱 특별하게 만드는 다양한 이벤트와 할인 혜택을 만나보세요!
            </Text>
          </VStack>
        </Box>

        {/* 카테고리 필터 */}
        <Box bg="white" borderRadius="xl" boxShadow="md" p={4}>
          <HStack spacing={4} justify="center" flexWrap="wrap">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? 'solid' : 'outline'}
                colorScheme="teal"
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Button>
            ))}
          </HStack>
        </Box>

        {/* 이벤트 목록 */}
        <Box>
          <Heading size="md" mb={6} color="teal.700">
            이벤트 목록 ({filteredEvents.length}개)
          </Heading>
          
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            {filteredEvents.map((event) => (
              <Box
                key={event.id}
                bg="white"
                borderRadius="xl"
                boxShadow="md"
                overflow="hidden"
                _hover={{ boxShadow: 'xl', transform: 'translateY(-4px)' }}
                transition="all 0.2s"
              >
                <Box position="relative">
                  <Image
                    src={event.image_url}
                    alt={event.title}
                    w="100%"
                    h="200px"
                    objectFit="cover"
                  />
                  <Badge
                    position="absolute"
                    top={2}
                    right={2}
                    colorScheme={getStatusColor(event.status)}
                    variant="solid"
                    borderRadius="full"
                    px={2}
                  >
                    {getStatusText(event.status)}
                  </Badge>
                  <Badge
                    position="absolute"
                    top={2}
                    left={2}
                    colorScheme="teal"
                    variant="solid"
                    borderRadius="full"
                    px={2}
                  >
                    {event.discount}
                  </Badge>
                </Box>
                
                <Box p={4}>
                  <Heading size="md" color="teal.700" mb={2} noOfLines={2}>
                    {event.title}
                  </Heading>
                  
                  <Text color="gray.600" fontSize="sm" mb={3} noOfLines={3}>
                    {event.description}
                  </Text>
                  
                  <VStack align="stretch" spacing={2} fontSize="sm" color="gray.700">
                    <HStack>
                      <FaCalendar color="teal" />
                      <Text>{event.start_date} ~ {event.end_date}</Text>
                    </HStack>
                    
                    <HStack>
                      <FaMapMarkerAlt color="teal" />
                      <Text>{event.location}</Text>
                    </HStack>
                    
                    <HStack>
                      <FaUsers color="teal" />
                      <Text>참여자: {event.participants}/{event.max_participants}</Text>
                    </HStack>
                    
                    <Progress 
                      value={(event.participants / event.max_participants) * 100} 
                      colorScheme="teal" 
                      size="sm" 
                      borderRadius="full"
                    />
                  </VStack>
                  
                  <Button
                    colorScheme="teal"
                    size="sm"
                    w="100%"
                    mt={4}
                    onClick={() => handleParticipate(event.id)}
                    isDisabled={event.status === 'ended'}
                  >
                    {event.status === 'ended' ? '종료됨' : '참여하기'}
                  </Button>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Box>

        {/* 이벤트 안내 */}
        <Box bg="white" borderRadius="2xl" boxShadow="lg" p={6}>
          <Heading size="md" mb={4} color="teal.700">이벤트 참여 안내</Heading>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <VStack align="stretch" spacing={3}>
              <HStack>
                <Icon as={FaClock} color="teal" />
                <Text fontWeight="bold">이벤트 기간</Text>
              </HStack>
              <Text fontSize="sm" color="gray.600" pl={6}>
                각 이벤트의 시작일부터 종료일까지 참여 가능합니다.
              </Text>
              
              <HStack>
                <Icon as={FaUsers} color="teal" />
                <Text fontWeight="bold">참여 인원</Text>
              </HStack>
              <Text fontSize="sm" color="gray.600" pl={6}>
                선착순으로 참여 인원이 제한될 수 있습니다.
              </Text>
            </VStack>
            
            <VStack align="stretch" spacing={3}>
              <HStack>
                <Icon as={FaGift} color="teal" />
                <Text fontWeight="bold">혜택 제공</Text>
              </HStack>
              <Text fontSize="sm" color="gray.600" pl={6}>
                이벤트 종료 후 1주일 내에 혜택이 제공됩니다.
              </Text>
              
              <HStack>
                <Icon as={FaTag} color="teal" />
                <Text fontWeight="bold">할인 적용</Text>
              </HStack>
              <Text fontSize="sm" color="gray.600" pl={6}>
                할인 혜택은 중복 적용이 불가능합니다.
              </Text>
            </VStack>
          </SimpleGrid>
        </Box>
      </VStack>
    </Container>
  );
} 