import { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useRouter } from 'next/router';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      toast({
        title: '입력 오류',
        description: '모든 항목을 입력하세요.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: '비밀번호 불일치',
        description: '비밀번호가 일치하지 않습니다.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast({
        title: '회원가입 성공',
        description: '이제 로그인해 주세요!',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
      router.push('/login');
    } catch (error: any) {
      toast({
        title: '회원가입 실패',
        description: error.message,
        status: 'error',
        duration: 4000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="sm" py={16}>
      <Box p={8} bg="white" borderRadius="xl" boxShadow="2xl">
        <Heading as="h2" size="lg" mb={8} textAlign="center" color="teal.600">
          회원가입
        </Heading>
        <form onSubmit={handleSignup}>
          <VStack spacing={6}>
            <FormControl id="email" isRequired>
              <FormLabel>이메일</FormLabel>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
              />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>비밀번호</FormLabel>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
              />
            </FormControl>
            <FormControl id="confirmPassword" isRequired>
              <FormLabel>비밀번호 확인</FormLabel>
              <Input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
              />
            </FormControl>
            <Button colorScheme="teal" type="submit" w="100%" isLoading={loading}>
              회원가입
            </Button>
            <Text fontSize="sm" color="gray.600">
              이미 계정이 있으신가요?{' '}
              <Link as={NextLink} href="/login" color="teal.500" fontWeight="bold">
                로그인
              </Link>
            </Text>
          </VStack>
        </form>
      </Box>
    </Container>
  );
} 