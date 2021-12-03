import React from "react";
import {
  Container,
  ImgWrapper,
  Img,
  Video,
  Title,
  Description,
  TextWrapper,
  OuterContainer,
} from "./elements";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

import "./style.css";
import Image1 from "../../images/meme.png";
import Image2 from "../../images/gogo.jpeg";
import Image3 from "../../images/A.jpg";

const Post = ({ content, video, segment, index }) => {
  return (
    <>
      <Container>
        {video ? (
          <Link to={`/${segment}/${index}`}>
            <ImgWrapper>
              <Video
                title="vimeo-player"
                src={content.video}
                // width="500"
                // height="500"
                frameBorder="0"
                allowFullScreen
              ></Video>
            </ImgWrapper>
          </Link>
        ) : (
          <ImgWrapper>
            <Img src={content.img}></Img>
          </ImgWrapper>
        )}

        <TextWrapper>
          <Title>{content.title} </Title>
          <Description>{content.description}</Description>
        </TextWrapper>
        {/* <Button className="button"> Book a Call </Button> */}
      </Container>
    </>
  );
};

export default Post;
