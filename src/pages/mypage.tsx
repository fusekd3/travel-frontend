import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Avatar,
  Input,
  FormControl,
  FormLabel,
  useToast,
  Divider,
  Icon,
  Badge,
  Grid,
  GridItem,
  Card,
  CardBody,
  Heading,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Select,
} from '@chakra-ui/react';
import {
  FaUser,
  FaEdit,
  FaCamera,
  FaMapMarkedAlt,
  FaCalendarAlt,
  FaHeart,
  FaCog,
  FaSignOutAlt,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

interface UserProfile {
  displayName: string;
  email: string;
  photoURL: string;
  phoneNumber?: string;
  preferences: {
    language: string;
    currency: string;
    notifications: boolean;
  };
}

const MyPage: React.FC = () => {
  const { user, signOutUser } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState<UserProfile>({
    displayName: user?.displayName || '',
    email: user?.email || '',
    photoURL: user?.photoURL || '',
    phoneNumber: '',
    preferences: {
      language: 'ko',
      currency: 'KRW',
      notifications: true,
    },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editProfile, setEditProfile] = useState<UserProfile>(profile);

  // 모의 데이터
  const mockTravelPlans = [
    { id: 1, title: '제주도 여행', date: '2024-01-15', status: 'completed' },
    { id: 2, title: '부산 여행', date: '2024-02-20', status: 'upcoming' },
    { id: 3, title: '도쿄 여행', date: '2024-03-10', status: 'planning' },
  ];

  const mockBookings = [
    { id: 1, hotel: '제주 그랜드 호텔', date: '2024-01-15', status: 'confirmed' },
    { id: 2, hotel: '부산 마린파크 호텔', date: '2024-02-20', status: 'upcoming' },
  ];

  const mockFavorites = [
    { id: 1, name: '제주 성산일출봉', type: '관광지' },
    { id: 2, name: '부산 해운대', type: '해변' },
    { id: 3, name: '도쿄 시부야', type: '쇼핑' },
  ];

  const handleSaveProfile = () => {
    setProfile(editProfile);
    setIsEditing(false);
    toast({
      title: '프로필 업데이트 완료',
      description: '프로필이 성공적으로 업데이트되었습니다.',
      status: 'success',
      duration: 3000,
    });
  };

  const handleCancelEdit = () => {
    setEditProfile(profile);
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    try {
      await signOutUser();
      toast({
        title: '로그아웃 완료',
        description: '안전하게 로그아웃되었습니다.',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: '로그아웃 실패',
        description: '로그아웃 중 오류가 발생했습니다.',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'upcoming':
        return 'blue';
      case 'planning':
        return 'yellow';
      case 'confirmed':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '완료';
      case 'upcoming':
        return '예정';
      case 'planning':
        return '계획 중';
      case 'confirmed':
        return '확정';
      default:
        return status;
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" pt="60px">
      <Box maxW="1200px" mx="auto" p={6}>
        {/* 헤더 */}
        <Box mb={8}>
          <Heading size="lg" color="teal.700" mb={2}>
            마이페이지
          </Heading>
          <Text color="gray.600">여행 계획과 예약을 관리하세요</Text>
        </Box>

        <Grid templateColumns={{ base: '1fr', lg: '300px 1fr' }} gap={8}>
          {/* 왼쪽 사이드바 - 프로필 정보 */}
          <GridItem>
            <Card>
              <CardBody>
                <VStack spacing={6} align="stretch">
                  {/* 프로필 사진 및 기본 정보 */}
                  <VStack spacing={4}>
                    <Box position="relative">
                      <Avatar
                        size="2xl"
                        src={profile.photoURL}
                        name={profile.displayName}
                        bg="teal.500"
                      />
                      <Button
                        size="sm"
                        colorScheme="teal"
                        position="absolute"
                        bottom="0"
                        right="0"
                        borderRadius="full"
                        minW="auto"
                        p={2}
                      >
                        <Icon as={FaCamera} />
                      </Button>
                    </Box>
                    <VStack spacing={2}>
                      <Text fontSize="lg" fontWeight="bold">
                        {profile.displayName || '사용자'}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {profile.email}
                      </Text>
                    </VStack>
                  </VStack>

                  <Divider />

                  {/* 빠른 액션 */}
                  <VStack spacing={3} align="stretch">
                    <Button
                      leftIcon={<Icon as={FaEdit} />}
                      variant="outline"
                      colorScheme="teal"
                      onClick={() => setIsEditing(true)}
                    >
                      프로필 수정
                    </Button>
                    <Button
                      leftIcon={<Icon as={FaCog} />}
                      variant="outline"
                      colorScheme="blue"
                    >
                      설정
                    </Button>
                    <Button
                      leftIcon={<Icon as={FaSignOutAlt} />}
                      variant="outline"
                      colorScheme="red"
                      onClick={handleSignOut}
                    >
                      로그아웃
                    </Button>
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* 오른쪽 메인 콘텐츠 */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* 여행 계획 섹션 */}
              <Card>
                <CardBody>
                  <HStack justify="space-between" mb={4}>
                    <HStack>
                      <Icon as={FaMapMarkedAlt} color="teal.500" />
                      <Heading size="md">여행 계획</Heading>
                    </HStack>
                    <Badge colorScheme="teal" variant="subtle">
                      {mockTravelPlans.length}개
                    </Badge>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {mockTravelPlans.map((plan) => (
                      <Box
                        key={plan.id}
                        p={4}
                        border="1px"
                        borderColor="gray.200"
                        borderRadius="md"
                        bg="white"
                      >
                        <VStack align="start" spacing={2}>
                          <Text fontWeight="bold">{plan.title}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {plan.date}
                          </Text>
                          <Badge colorScheme={getStatusColor(plan.status)}>
                            {getStatusText(plan.status)}
                          </Badge>
                        </VStack>
                      </Box>
                    ))}
                  </SimpleGrid>
                </CardBody>
              </Card>

              {/* 예약 내역 섹션 */}
              <Card>
                <CardBody>
                  <HStack justify="space-between" mb={4}>
                    <HStack>
                      <Icon as={FaCalendarAlt} color="blue.500" />
                      <Heading size="md">예약 내역</Heading>
                    </HStack>
                    <Badge colorScheme="blue" variant="subtle">
                      {mockBookings.length}개
                    </Badge>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                    {mockBookings.map((booking) => (
                      <Box
                        key={booking.id}
                        p={4}
                        border="1px"
                        borderColor="gray.200"
                        borderRadius="md"
                        bg="white"
                      >
                        <VStack align="start" spacing={2}>
                          <Text fontWeight="bold">{booking.hotel}</Text>
                          <Text fontSize="sm" color="gray.600">
                            {booking.date}
                          </Text>
                          <Badge colorScheme={getStatusColor(booking.status)}>
                            {getStatusText(booking.status)}
                          </Badge>
                        </VStack>
                      </Box>
                    ))}
                  </SimpleGrid>
                </CardBody>
              </Card>

              {/* 즐겨찾기 섹션 */}
              <Card>
                <CardBody>
                  <HStack justify="space-between" mb={4}>
                    <HStack>
                      <Icon as={FaHeart} color="red.500" />
                      <Heading size="md">즐겨찾기</Heading>
                    </HStack>
                    <Badge colorScheme="red" variant="subtle">
                      {mockFavorites.length}개
                    </Badge>
                  </HStack>
                  <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                    {mockFavorites.map((favorite) => (
                      <Box
                        key={favorite.id}
                        p={4}
                        border="1px"
                        borderColor="gray.200"
                        borderRadius="md"
                        bg="white"
                      >
                        <VStack align="start" spacing={2}>
                          <Text fontWeight="bold">{favorite.name}</Text>
                          <Badge colorScheme="purple" variant="subtle">
                            {favorite.type}
                          </Badge>
                        </VStack>
                      </Box>
                    ))}
                  </SimpleGrid>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>
        </Grid>

        {/* 프로필 수정 모달 */}
        <Modal isOpen={isEditing} onClose={handleCancelEdit} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>프로필 수정</ModalHeader>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>이름</FormLabel>
                  <Input
                    value={editProfile.displayName}
                    onChange={(e) =>
                      setEditProfile({
                        ...editProfile,
                        displayName: e.target.value,
                      })
                    }
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>전화번호</FormLabel>
                  <Input
                    value={editProfile.phoneNumber}
                    onChange={(e) =>
                      setEditProfile({
                        ...editProfile,
                        phoneNumber: e.target.value,
                      })
                    }
                    placeholder="010-1234-5678"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>언어</FormLabel>
                  <Select
                    value={editProfile.preferences.language}
                    onChange={(e) =>
                      setEditProfile({
                        ...editProfile,
                        preferences: {
                          ...editProfile.preferences,
                          language: e.target.value,
                        },
                      })
                    }
                  >
                    <option value="ko">한국어</option>
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>통화</FormLabel>
                  <Select
                    value={editProfile.preferences.currency}
                    onChange={(e) =>
                      setEditProfile({
                        ...editProfile,
                        preferences: {
                          ...editProfile.preferences,
                          currency: e.target.value,
                        },
                      })
                    }
                  >
                    <option value="KRW">KRW (원)</option>
                    <option value="USD">USD ($)</option>
                    <option value="JPY">JPY (¥)</option>
                  </Select>
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={handleCancelEdit}>
                취소
              </Button>
              <Button colorScheme="teal" onClick={handleSaveProfile}>
                저장
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
};

export default MyPage;