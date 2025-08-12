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
  Textarea,
  Input,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Icon,
  Flex,
  useBreakpointValue,
} from '@chakra-ui/react';
import { FaStar, FaMapMarkerAlt, FaUser, FaCalendar, FaThumbsUp, FaComment } from 'react-icons/fa';

interface Review {
  id: number;
  user: string;
  spot_name: string;
  spot_address: string;
  rating: number;
  content: string;
  date: string;
  likes: number;
  comments: number;
  image_url?: string;
}

export default function ReviewPage() {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 1,
      user: '여행러버123',
      spot_name: '남산타워',
      spot_address: '서울특별시 용산구 남산공원길 105',
      rating: 5,
      content: 'AI가 추천해준 코스로 방문했는데 정말 완벽했어요! 야경이 너무 아름다웠고, 특히 저녁 시간대 방문을 추천합니다. 주변 맛집도 함께 둘러보시면 좋을 것 같아요.',
      date: '2024-05-15',
      likes: 24,
      comments: 5,
      image_url: 'https://images.unsplash.com/photo-1538489949603-cbabf5b0c4a5?w=400',
    },
    {
      id: 2,
      user: '맛집탐방러',
      spot_name: '부산 감천문화마을',
      spot_address: '부산광역시 사하구 감천동',
      rating: 4,
      content: '색채가 정말 예뻐요! 사진 찍기 좋은 곳이 많았고, 특히 해질녘에 방문하면 더욱 아름다운 풍경을 볼 수 있어요. 다만 경사가 있어서 편한 신발을 추천합니다.',
      date: '2024-05-10',
      likes: 18,
      comments: 3,
      image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    },
    {
      id: 3,
      user: '혼행족',
      spot_name: '제주 올레길',
      spot_address: '제주특별자치도 전역',
      rating: 5,
      content: '혼자 여행하기에 완벽한 곳이에요! AI가 추천해준 코스가 정말 좋았고, 자연 속에서 힐링할 수 있었어요. 다음에도 AI 추천을 믿고 여행할 것 같습니다.',
      date: '2024-05-08',
      likes: 31,
      comments: 8,
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
    },
    {
      id: 4,
      user: '가족여행러',
      spot_name: '한강공원',
      spot_address: '서울특별시 영등포구 여의도동',
      rating: 4,
      content: '가족과 함께 피크닉하기 좋은 곳이에요! AI가 추천한 시기가 정말 좋았고, 아이들도 정말 즐거워했어요. 다음 봄에도 꼭 다시 방문하고 싶어요.',
      date: '2024-05-05',
      likes: 15,
      comments: 2,
      image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
    },
    {
      id: 5,
      user: '커플여행러',
      spot_name: '북촌한옥마을',
      spot_address: '서울특별시 종로구 계동',
      rating: 5,
      content: '로맨틱한 데이트 코스로 완벽했어요! AI가 추천한 시간대와 동선이 정말 좋았고, 한복 체험도 함께 해서 더욱 특별한 추억을 만들었어요.',
      date: '2024-05-03',
      likes: 27,
      comments: 6,
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
    },
    {
      id: 6,
      user: '문화탐방러',
      spot_name: '경주 동궁과 월지',
      spot_address: '경상북도 경주시 원화로 102',
      rating: 4,
      content: '역사와 문화를 느낄 수 있는 아름다운 곳이에요! AI가 추천한 야경 시간대가 정말 좋았고, 특히 월지의 반영이 정말 아름다웠어요.',
      date: '2024-05-01',
      likes: 22,
      comments: 4,
      image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
    },
  ]);

  const [selectedRating, setSelectedRating] = useState(5);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [newReview, setNewReview] = useState({
    spot_name: '',
    spot_address: '',
    rating: 5,
    content: '',
  });
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const categories = [
    { value: 'all', label: '전체' },
    { value: '5', label: '5점' },
    { value: '4', label: '4점' },
    { value: '3', label: '3점' },
    { value: '2', label: '2점' },
    { value: '1', label: '1점' },
  ];

  const handleWriteReview = () => {
    if (!newReview.spot_name || !newReview.content) {
      toast({
        title: '필수 정보를 입력해주세요',
        description: '여행지명과 리뷰 내용을 입력해주세요.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const review: Review = {
      id: reviews.length + 1,
      user: '나의리뷰',
      spot_name: newReview.spot_name,
      spot_address: newReview.spot_address,
      rating: newReview.rating,
      content: newReview.content,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      comments: 0,
    };

    setReviews([review, ...reviews]);
    setNewReview({
      spot_name: '',
      spot_address: '',
      rating: 5,
      content: '',
    });
    onClose();
    
    toast({
      title: '리뷰가 등록되었습니다',
      description: '다른 사용자들과 여행 경험을 공유해주셔서 감사합니다!',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleLike = (reviewId: number) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, likes: review.likes + 1 }
        : review
    ));
  };

  const filteredReviews = selectedCategory === 'all' 
    ? reviews 
    : reviews.filter(review => review.rating === parseInt(selectedCategory));

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <Container maxW="container.lg" py={8}>
      <VStack spacing={8} align="stretch">
        {/* 헤더 섹션 */}
        <Box bg="white" borderRadius="2xl" boxShadow="lg" p={6}>
          <VStack spacing={4}>
            <Heading size="lg" color="teal.700">여행 리뷰</Heading>
            <Text color="gray.600" textAlign="center">
              실제 여행자들의 생생한 후기와 AI 추천 여행지에 대한 솔직한 평가
            </Text>
            
            <HStack spacing={4}>
              <VStack>
                <Text fontSize="2xl" fontWeight="bold" color="teal.700">
                  {averageRating}
                </Text>
                <HStack>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar 
                      key={star} 
                      color={star <= parseFloat(averageRating) ? '#319795' : '#E2E8F0'} 
                    />
                  ))}
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  평균 평점 ({reviews.length}개 리뷰)
                </Text>
              </VStack>
            </HStack>
            
            <Button
              colorScheme="teal"
              size="lg"
              onClick={onOpen}
            >
              리뷰 작성하기
            </Button>
          </VStack>
        </Box>

        {/* 필터 */}
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

        {/* 리뷰 목록 */}
        <Box>
          <Heading size="md" mb={6} color="teal.700">
            리뷰 목록 ({filteredReviews.length}개)
          </Heading>
          
          <VStack spacing={6} align="stretch">
            {filteredReviews.map((review) => (
              <Box
                key={review.id}
                bg="white"
                borderRadius="xl"
                boxShadow="md"
                overflow="hidden"
              >
                <HStack spacing={4} p={6} align="flex-start">
                  {review.image_url && (
                    <Image
                      src={review.image_url}
                      alt={review.spot_name}
                      w="120px"
                      h="120px"
                      objectFit="cover"
                      borderRadius="md"
                      flexShrink={0}
                    />
                  )}
                  
                  <VStack align="stretch" flex={1} spacing={3}>
                    <HStack justify="space-between">
                      <Heading size="md" color="teal.700">
                        {review.spot_name}
                      </Heading>
                      <HStack>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar 
                            key={star} 
                            color={star <= review.rating ? '#319795' : '#E2E8F0'} 
                            size={16}
                          />
                        ))}
                      </HStack>
                    </HStack>
                    
                    <HStack fontSize="sm" color="gray.600">
                      <FaMapMarkerAlt />
                      <Text>{review.spot_address}</Text>
                    </HStack>
                    
                    <Text color="gray.700" lineHeight="1.6">
                      {review.content}
                    </Text>
                    
                    <HStack justify="space-between" fontSize="sm" color="gray.500">
                      <HStack spacing={4}>
                        <HStack>
                          <FaUser />
                          <Text>{review.user}</Text>
                        </HStack>
                        <HStack>
                          <FaCalendar />
                          <Text>{review.date}</Text>
                        </HStack>
                      </HStack>
                      
                      <HStack spacing={4}>
                        <Button
                          size="sm"
                          variant="ghost"
                          leftIcon={<FaThumbsUp />}
                          onClick={() => handleLike(review.id)}
                        >
                          {review.likes}
                        </Button>
                        <HStack>
                          <FaComment />
                          <Text>{review.comments}</Text>
                        </HStack>
                      </HStack>
                    </HStack>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* 리뷰 작성 모달 */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>리뷰 작성하기</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <Input
                  placeholder="여행지명"
                  value={newReview.spot_name}
                  onChange={(e) => setNewReview({...newReview, spot_name: e.target.value})}
                />
                
                <Input
                  placeholder="주소 (선택사항)"
                  value={newReview.spot_address}
                  onChange={(e) => setNewReview({...newReview, spot_address: e.target.value})}
                />
                
                <HStack>
                  <Text>평점:</Text>
                  <HStack>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar 
                        key={star} 
                        color={star <= newReview.rating ? '#319795' : '#E2E8F0'} 
                        size={20}
                        style={{ cursor: 'pointer' }}
                        onClick={() => setNewReview({...newReview, rating: star})}
                      />
                    ))}
                  </HStack>
                </HStack>
                
                <Textarea
                  placeholder="여행 경험을 자유롭게 작성해주세요..."
                  value={newReview.content}
                  onChange={(e) => setNewReview({...newReview, content: e.target.value})}
                  rows={6}
                />
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                취소
              </Button>
              <Button colorScheme="teal" onClick={handleWriteReview}>
                리뷰 등록
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Container>
  );
} 