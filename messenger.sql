-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Czas generowania: 04 Paź 2019, 20:49
-- Wersja serwera: 10.1.36-MariaDB
-- Wersja PHP: 7.2.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Baza danych: `messenger`
--

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `chats`
--

CREATE TABLE `chats` (
  `chatId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

--
-- Zrzut danych tabeli `chats`
--

-- --------------------------------------------------------

--
-- Zastąpiona struktura widoku `latestMessagesByChats`
-- (Zobacz poniżej rzeczywisty widok)
--
CREATE TABLE `latestMessagesByChats` (
`chatId` int(11)
,`messageId` int(11)
,`timestamp` text
);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `logs`
--

CREATE TABLE `logs` (
  `logId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `timestamp` text COLLATE utf8_polish_ci NOT NULL,
  `action` text COLLATE utf8_polish_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `messages`
--

CREATE TABLE `messages` (
  `messageId` int(11) NOT NULL,
  `chatId` int(11) NOT NULL,
  `content` text COLLATE utf8_polish_ci NOT NULL,
  `timestamp` text COLLATE utf8_polish_ci NOT NULL,
  `isRead` tinyint(1) DEFAULT NULL,
  `type` tinyint(1) DEFAULT NULL,
  `senderCanSee` tinyint(1) DEFAULT '1',
  `receiverCanSee` tinyint(1) DEFAULT '1',
  `userId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `userChat`
--

CREATE TABLE `userChat` (
  `userChatId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `chatId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `users`
--

CREATE TABLE `users` (
  `userId` int(11) NOT NULL,
  `email` text COLLATE utf8_polish_ci NOT NULL,
  `password` text COLLATE utf8_polish_ci NOT NULL,
  `name` text COLLATE utf8_polish_ci NOT NULL,
  `surname` text COLLATE utf8_polish_ci NOT NULL,
  `isActive` tinyint(1) DEFAULT '0',
  `lastSeen` text COLLATE utf8_polish_ci,
  `photo` text COLLATE utf8_polish_ci,
  `activated` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_polish_ci;

-- --------------------------------------------------------

--
-- Zastąpiona struktura widoku `usersAndTheirChats`
-- (Zobacz poniżej rzeczywisty widok)
--
CREATE TABLE `usersAndTheirChats` (
`userId` int(11)
,`name` mediumtext
,`chatId` int(11)
,`userChatId` int(11)
);

-- --------------------------------------------------------

--
-- Struktura widoku `latestMessagesByChats`
--
DROP TABLE IF EXISTS `latestMessagesByChats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `latestMessagesByChats`  AS  select `messages`.`chatId` AS `chatId`,max(`messages`.`messageId`) AS `messageId`,`messages`.`timestamp` AS `timestamp` from `messages` group by `messages`.`chatId` ;

-- --------------------------------------------------------

--
-- Struktura widoku `usersAndTheirChats`
--
DROP TABLE IF EXISTS `usersAndTheirChats`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `usersAndTheirChats`  AS  select distinct `users`.`userId` AS `userId`,concat_ws(' ',`users`.`name`,`users`.`surname`) AS `name`,`userChat`.`chatId` AS `chatId`,`userChat`.`userChatId` AS `userChatId` from ((`users` join `userChat`) join `chats`) where ((`users`.`userId` = `userChat`.`userId`) and (`chats`.`chatId` = `userChat`.`chatId`)) ;

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `chats`
--
ALTER TABLE `chats`
  ADD PRIMARY KEY (`chatId`),
  ADD KEY `chatId` (`chatId`);

--
-- Indeksy dla tabeli `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`logId`),
  ADD KEY `logId` (`logId`),
  ADD KEY `user` (`userId`);

--
-- Indeksy dla tabeli `messages`
--
ALTER TABLE `messages`
  ADD PRIMARY KEY (`messageId`),
  ADD KEY `messageId` (`messageId`),
  ADD KEY `sender` (`userId`),
  ADD KEY `chatId` (`chatId`);

--
-- Indeksy dla tabeli `userChat`
--
ALTER TABLE `userChat`
  ADD PRIMARY KEY (`userChatId`),
  ADD KEY `user` (`userId`),
  ADD KEY `chat` (`chatId`);

--
-- Indeksy dla tabeli `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`userId`),
  ADD KEY `userId` (`userId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT dla tabeli `chats`
--
ALTER TABLE `chats`
  MODIFY `chatId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT dla tabeli `logs`
--
ALTER TABLE `logs`
  MODIFY `logId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT dla tabeli `messages`
--
ALTER TABLE `messages`
  MODIFY `messageId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT dla tabeli `userChat`
--
ALTER TABLE `userChat`
  MODIFY `userChatId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- AUTO_INCREMENT dla tabeli `users`
--
ALTER TABLE `users`
  MODIFY `userId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=1;

--
-- Ograniczenia dla zrzutów tabel
--

--
-- Ograniczenia dla tabeli `logs`
--
ALTER TABLE `logs`
  ADD CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);

--
-- Ograniczenia dla tabeli `messages`
--
ALTER TABLE `messages`
  ADD CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`),
  ADD CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`chatId`) REFERENCES `chats` (`chatId`);

--
-- Ograniczenia dla tabeli `userChat`
--
ALTER TABLE `userChat`
  ADD CONSTRAINT `userChat_ibfk_1` FOREIGN KEY (`chatId`) REFERENCES `chats` (`chatId`),
  ADD CONSTRAINT `userChat_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`userId`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
