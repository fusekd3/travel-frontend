import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Checkbox,
  CheckboxGroup,
  VStack,
  Heading,
} from '@chakra-ui/react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface TravelFormProps {
  onSubmit: (data: any) => void;
}

const TravelForm: React.FC<TravelFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    destination: '',
    companions: [] as string[],
    budget: 0,
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    interests: [] as string[],
  });

  const interestOptions = [
    '자연/경관',
    '문화/역사',
    '음식/맛집',
    '쇼핑',
    '액티비티',
    '휴양/힐링',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Box as="form" onSubmit={handleSubmit} p={5} shadow="md" borderWidth="1px" borderRadius="md">
      <VStack spacing={4} align="stretch">
        <Heading size="md">여행 계획 만들기</Heading>

        <FormControl isRequired>
          <FormLabel>여행지</FormLabel>
          <Input
            placeholder="여행지를 입력하세요"
            value={formData.destination}
            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>동반자</FormLabel>
          <Select
            value={formData.companions[0] || ''}
            onChange={(e) => setFormData({ ...formData, companions: [e.target.value] })}
          >
            <option value="">선택해주세요</option>
            <option value="혼자">혼자</option>
            <option value="가족">가족</option>
            <option value="친구">친구</option>
            <option value="연인">연인</option>
            <option value="동료">동료</option>
          </Select>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>예산 (원)</FormLabel>
          <NumberInput
            min={0}
            value={formData.budget}
            onChange={(value) => setFormData({ ...formData, budget: Number(value) })}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>출발 날짜</FormLabel>
          <Input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>종료 날짜</FormLabel>
          <Input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            min={formData.start_date}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>출발 시간</FormLabel>
          <Input
            type="time"
            value={formData.start_time}
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>종료 시간</FormLabel>
          <Input
            type="time"
            value={formData.end_time}
            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>관심사</FormLabel>
          <Select
            value={formData.interests[0] || ''}
            onChange={(e) => setFormData({ ...formData, interests: [e.target.value] })}
          >
            <option value="">선택해주세요</option>
            <option value="자연">자연</option>
            <option value="문화">문화</option>
            <option value="음식">음식</option>
            <option value="쇼핑">쇼핑</option>
            <option value="액티비티">액티비티</option>
          </Select>
        </FormControl>

        <Button type="submit" colorScheme="blue">
          여행 계획 생성하기
        </Button>
      </VStack>
    </Box>
  );
};

export default TravelForm; 