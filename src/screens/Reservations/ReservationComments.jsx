import { Avatar, Box, Card, Flex, Paper, Text } from "@mantine/core"
import classes from "./Reservations.module.css"
import dayjs from "dayjs"
import { IconCalendarCheck } from "@tabler/icons-react"

export const ReservationComments = ({ isAdminComment, id, name, createdAt, image, userComment }) => {
  const initials = name
    ?.split(" ")
    .filter((_, i, arr) => i === 0 || i === arr.length - 1)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()

  const avatar = <Avatar src={image} alt="User profile image" name={initials} />

  const meta = (
    <Box>
      <Text fz="sm" ta={isAdminComment ? "end" : "start"}>
        {name}
      </Text>
      <Text fz="xs" c="dimmed" ta={isAdminComment ? "end" : "start"}>
        {dayjs(createdAt).fromNow()}
      </Text>
    </Box>
  )

  return (
    <>
      {name ? (
        <Paper key={id} withBorder radius="md" mb="sm" className={classes.comment}>
          <>
            <Flex justify={isAdminComment ? "flex-end" : "flex-start"} gap="xs" align="center">
              {isAdminComment ? (
                <>
                  {meta}
                  {avatar}
                </>
              ) : (
                <>
                  {avatar}
                  {meta}
                </>
              )}
            </Flex>
            <Text
              pr={isAdminComment ? 50 : undefined}
              pl={!isAdminComment ? 50 : undefined}
              pt="sm"
              size="sm"
              ta={isAdminComment ? "right" : "left"}>
              {userComment}
            </Text>
          </>
        </Paper>
      ) : (
        <Card withBorder radius="md" bg="violet.9" mb="sm">
          <Flex align="center" gap={5}>
            <IconCalendarCheck size="1.8rem" />
            <Flex direction='column'>
              <Text fw='bold' size="sm">{userComment.replace(/\bde\b/, "del").replace(/\ba\b/, "al")}</Text>
              <Text fz="xs" opacity={0.8}>
                {dayjs(createdAt).fromNow()}
              </Text>
            </Flex>
          </Flex>
        </Card>
      )}
    </>
  )
}
